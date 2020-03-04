import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import 'rxjs/add/observable/timer';
import * as moment from 'moment';

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

    // dropdown options for live range, values in hourss
    @Input() dateRangeOptions = [
        { label: '---', value: null },
        { label: 'Last 1 hour', value: 1 },
        { label: 'Last 6 hours', value: 6 },
        { label: 'Last 12 hours', value: 12 },
        { label: 'Last day', value: 24 },
        { label: 'Last 3 days', value: 24 * 3 },
        { label: 'Last week', value: 24 * 7 }
    ];

    // when the start/end dates are applied
    @Output() dateFilterSelected: EventEmitter<{start: string, end: string}> = new EventEmitter();
    // when the parent component should make an api call to update the data
    @Output() updated: EventEmitter<{start: string, end: string}> = new EventEmitter();

    selectedDateRange: any;
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
    get utcStartDate(): Date { return UTCDates.localDateToUTC(this.startDate); }
    get utcEndDate(): Date { return UTCDates.localDateToUTC(this.endDate); }

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
     * Callback for when a normal start/end value is applied
     */
    onDateFilterApply(): void {
        // send out the converted date strings
        this.dateFilterSelected.emit({
            start: this.utcStartDate.toISOString(),
            end: this.utcEndDate.toISOString()
        });

        if (this.startDate >= this.endDate) {
            this.messageService.add({severity: 'error', summary: 'Error querying range', detail: 'Provided FROM date is before TO date'});
        } else {
            // make call to emit out the update hook
            this.update();
        }
    }

    /**
     * Update hook to emit out the start/end dates the parent component should filter on.
     */
    private update(): void {
        this.updated.emit({
            start: this.utcStartDate.toISOString(),
            end: this.utcEndDate.toISOString()
        });
    }

    ngOnInit() {
        // prevent expression changed error
        setTimeout(() => {
            if (this.started && this.ended) {
                // start/end dates were set from parent (router)
                this.startDate = UTCDates.utcDateToLocal(this.started);
                this.endDate = UTCDates.utcDateToLocal(this.ended);
                this.onDateFilterApply();
            } else {
                // nothing provided by parent component or found in storage
                // use date filter on the last day
                const now = moment();
                this.endDate = now.toDate();
                this.startDate = now.clone().subtract(1, 'day').toDate();
                this.onDateFilterApply();
            }
        });
    }

}
