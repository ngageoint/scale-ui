import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import { MenuItem } from 'primeng/api';
import * as moment from 'moment';
import { isNil } from 'lodash';

import { UTCDates } from '../../utils/utcdates';

@Component({
    selector: 'dev-temporal-filter',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class TemporalFilterComponent implements OnInit {
    @Input() started: string;
    @Input() ended: string;
    @Input() loading = false;

    // when the parent component should make an api call to update the data
    @Output() updated: EventEmitter<{start: string, end: string}> = new EventEmitter();

    // options for date range selection
    dateRangeOptions: MenuItem[];

    // initial date to show in the calendar
    defaultDate: Date;

    // internal dates for this component
    startDate: Date;
    endDate: Date;

    // year range to show in the calendar dropdown
    get yearRange(): string {
        const now = moment();
        const start = now.clone().subtract(20, 'y').year();
        const end = now.clone().add(5, 'y').year();
        return `${start}:${end}`;
    }

    // utc versions of internal start and end dates
    get utcStartDate(): Date {
        return this.startDate ? UTCDates.localDateToUTC(this.startDate) : null;
    }
    get utcEndDate(): Date {
        return this.endDate ? UTCDates.localDateToUTC(this.endDate) : null;
    }

    // determines if the form inputs are valid
    get isValid(): boolean {
        if (this.startDate && this.endDate) {
            return this.startDate < this.endDate;
        }
        return true;
    }

    constructor(
        private messageService: MessageService
    ) {
    }

    /**
     * Callback for when a start/end value is applied.
     */
    onDateFilterApply(): void {
        // ensure a valid start/end range
        if (this.startDate && this.endDate && this.startDate >= this.endDate) {
            this.messageService.add({severity: 'error', summary: 'Error querying range', detail: 'Provided FROM date is before TO date'});
        } else {
            // make call to emit out the update hook
            this.updated.emit({
                start: this.utcStartDate ? this.utcStartDate.toISOString() : '',
                end: this.utcEndDate ? this.utcEndDate.toISOString() : '',
            });
        }
    }

    /**
     * Sets a range using now for the end date and offsetting by the number of hours.
     * @param hours number of hours prior to now for the start date
     */
    private selectRange(hours: number): void {
        const now = moment();
        this.startDate = UTCDates.utcDateToLocal(now.clone().subtract(hours, 'hour').toDate());
        this.endDate = UTCDates.utcDateToLocal(now.toDate());
        this.onDateFilterApply();
    }

    ngOnInit() {
        // setup date range options
        this.dateRangeOptions = [
            { label: 'Last hour', command: () => { this.selectRange(1); } },
            { label: 'Last 6 hours', command: () => { this.selectRange(6); } },
            { label: 'Last 12 hours', command: () => { this.selectRange(12); } },
            { label: 'Last day', command: () => { this.selectRange(24); } },
            { label: 'Last 3 days', command: () => { this.selectRange(24 * 3); } },
            { label: 'Last 7 days', command: () => { this.selectRange(24 * 7); } },
            { label: 'Last 30 days', command: () => { this.selectRange(24 * 30); } },
        ];

        // set the default date in utc
        this.defaultDate = UTCDates.localDateToUTC(moment().toDate());

        // prevent expression changed error
        setTimeout(() => {
            const now = moment();

            if (isNil(this.started)) {
                // started is null or undefined, provide a default
                this.startDate = UTCDates.utcDateToLocal(now.clone().subtract(1, 'day').toDate());
            } else if (this.started) {
                // started is probably a date, convert
                this.startDate = UTCDates.utcDateToLocal(this.started);
            }
            // else, started is an empty string, keep as null

            if (isNil(this.ended)) {
                this.endDate = UTCDates.utcDateToLocal(now.toDate());
            } else if (this.ended) {
                this.endDate = UTCDates.utcDateToLocal(this.ended);
            }

            this.onDateFilterApply();
        });
    }
}
