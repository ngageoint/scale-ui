import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MessageService } from 'primeng/components/common/messageservice';
import * as moment from 'moment';

import { environment } from '../../../../environments/environment';

@Component({
    selector: 'dev-temporal-filter',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class TemporalFilterComponent implements OnInit {
    private readonly storageKeyPrefix = 'scale.temporal-filter';
    @Input() started: string;
    private readonly startedKey = `${this.storageKeyPrefix}.started`;
    @Input() ended: string;
    private readonly endedKey = `${this.storageKeyPrefix}.ended`;
    @Input() liveRange: number;
    private readonly rangeKey = `${this.storageKeyPrefix}.range`;
    @Output() dateFilterApply: EventEmitter<any> = new EventEmitter();
    @Output() dateRangeSelected: EventEmitter<any> = new EventEmitter();
    dateFormat = environment.dateFormat;
    dateRangeOptions = [
        { label: '---', value: null },
        { label: 'Last 1 hour', value: 1 },
        { label: 'Last 6 hours', value: 6 },
        { label: 'Last 12 hours', value: 12 },
        { label: 'Last day', value: 24 },
        { label: 'Last 3 days', value: 24 * 3 },
        { label: 'Last week', value: 24 * 7 }
    ];

    startDate: Date;
    endDate: Date;

    get utcStartDate(): Date {
        return this.localDateToUTC(this.startDate);
    }

    get utcEndDate(): Date {
        return this.localDateToUTC(this.endDate);
    }

    get isLiveMode(): boolean {
        return !!this.liveRange;
    }

    constructor(
        public breakpointObserver: BreakpointObserver,
        private messageService: MessageService
    ) {
        /*

        TODO:
        - styles for input groups
        - verify emit back for live range
        - save settings to localstorage for switching across pages
        - remove custom utc calendar?
        - hook up @input for liveRange

        DESIGN:
        either in three states when this component initializes:
        - in normal range mode:
            - live range is null
            - start and end are set
        - in live mode:
            - live range is set (ignores start and end)
        - nothing is set:
            - live range should be kept as null
            - start/end should use one day range from now
         */
    }


    /**
     * Callback for when a normal start/end value is applied
     */
    onDateFilterApply(): void {
        // normal date filter was applied, turn off live mode
        this.liveRange = null;
        localStorage.removeItem(this.rangeKey);

        // send out the converted date strings
        this.dateFilterApply.emit({
            started: this.utcStartDate.toISOString(),
            ended: this.utcEndDate.toISOString()
        });

        localStorage.setItem(this.startedKey, this.utcStartDate.toISOString());
        localStorage.setItem(this.endedKey, this.utcEndDate.toISOString());

        if (this.started > this.ended) {
            // TODO validate
            this.messageService.add({severity: 'error', summary: 'Error querying range', detail: 'Provided FROM date is before TO date'});
        }
    }

    /**
     * Callback for when the live range model changes to either emit the value or reset the filter range.
     */
    onLiveRangeChange(): void {
        if (this.liveRange) {
            // ensure start/end filters are set to empty
            this.startDate = null;
            this.endDate = null;
            // emit out the date range was selected
            this.dateRangeSelected.emit({ unit: 'h', range: this.liveRange });
            localStorage.setItem(this.rangeKey, this.liveRange.toString());
        } else {
            // live range not provided, reset the normal start/end filters
            this.startDate = this.utcDateToLocal(this.started);
            this.endDate = this.utcDateToLocal(this.ended);
            localStorage.removeItem(this.rangeKey);

            // emit back out that the date ranges should be used
            this.dateFilterApply.emit({
                started: this.utcStartDate.toISOString(),
                ended: this.utcEndDate.toISOString()
            });
        }
    }

    ngOnInit() {
        // check if started was provided by the component, then sync to local storage
        // if not provided by component, try pulling it from local storage
        let storageHasStarted = false;
        if (this.started) {
            localStorage.setItem(this.startedKey, this.started);
        } else {
            this.started = localStorage.getItem(this.startedKey);
            storageHasStarted = true;
        }

        // same process for ended date
        let storageHasEnded = false;
        if (this.ended) {
            localStorage.setItem(this.endedKey, this.ended);
        } else {
            this.ended = localStorage.getItem(this.endedKey);
            storageHasEnded = true;
        }

        // if local storage had both, emit the values back out
        // TODO check if local storage actually got these values before emitting
        if (storageHasStarted && storageHasEnded) {
            this.dateFilterApply.emit({
                started: this.started,
                ended: this.ended
            });
        }

        // same for live range value
        if (this.liveRange) {
            localStorage.setItem(this.rangeKey, this.liveRange.toString());
        } else {
            const storageRange = localStorage.getItem(this.rangeKey);
            if (storageRange) {
                this.liveRange = parseInt(storageRange, 10);
                this.dateRangeSelected.emit({ unit: 'h', range: this.liveRange });
            }
        }

        // if not in live mode (no range value set), provide a start/end range for normal filters
        if (!this.isLiveMode) {
            // convert from the string value (utc) to local time (remove the timezone)
            if (this.started && this.ended) {
                this.startDate = this.utcDateToLocal(this.started);
                this.endDate = this.utcDateToLocal(this.ended);
            } else {
                // ensure at least a day range is provided
                const now = moment();
                this.endDate = now.toDate();
                this.startDate = now.clone().subtract(1, 'day').toDate();
            }
        }
    }

    /**
     * Converts and strips a date string to local date.
     * @param  date string or date with timezone component
     * @return      date object without timezone
     */
    private utcDateToLocal(date: string): Date {
        const v = moment(date).utc();
        return new Date(
            v.year(), v.month(), v.date(),
            v.hours(), v.minutes(), v.seconds(), v.milliseconds()
        );
    }

    /**
     * Converts and strips the given date to a date for UTC time.
     * @param  date string or date with timezone component
     * @return      date converted to UTC
     */
    private localDateToUTC(date: Date): Date {
        const v = moment(date);
        const utc = moment.utc([
            v.year(), v.month(), v.date(),
            v.hours(), v.minutes(), v.seconds(), v.milliseconds()
        ]);
        return utc.toDate();
    }
}
