import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import { Subscription, Observable } from 'rxjs';
import * as moment from 'moment';

@Component({
    selector: 'dev-temporal-filter',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class TemporalFilterComponent implements OnInit, OnDestroy {
    private readonly storageKeyPrefix = 'scale.temporal-filter';
    @Input() started: string;
    private readonly startedKey = `${this.storageKeyPrefix}.started`;
    @Input() ended: string;
    private readonly endedKey = `${this.storageKeyPrefix}.ended`;
    @Input() liveRange: number;
    private readonly liveRangeKey = `${this.storageKeyPrefix}.range`;

    // when the start/end dates are applied
    @Output() dateFilterSelected: EventEmitter<{start: string, end: string}> = new EventEmitter();
    // when the live range dropdown value is selected or cleared
    @Output() liveRangeSelected: EventEmitter<{hours: number}> = new EventEmitter();
    // when the parent component should make an api call to update the data
    // driven by the timer for the live range update, as well as normal start/end date filter apply
    @Output() updated: EventEmitter<{start: string, end: string}> = new EventEmitter();

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

    private liveRangeSubscription: Subscription;

    get yearRange(): string {
        const now = moment();
        const start = now.clone().subtract(20, 'y').year();
        const end = now.clone().add(5, 'y').year();
        return `${start}:${end}`;
    }

    get utcStartDate(): Date {
        return this.localDateToUTC(this.startDate);
    }

    get utcEndDate(): Date {
        return this.localDateToUTC(this.endDate);
    }

    get isLiveMode(): boolean {
        return !!this.liveRange;
    }

    get startedStorage(): string {
        return localStorage.getItem(this.startedKey);
    }
    set startedStorage(value: string) {
        this.setStorage(this.startedKey, value);
    }

    get endedStorage(): string {
        return localStorage.getItem(this.endedKey);
    }
    set endedStorage(value: string) {
        this.setStorage(this.endedKey, value);
    }

    get liveRangeStorage(): number {
        return parseInt(localStorage.getItem(this.liveRangeKey), 10);
    }
    set liveRangeStorage(value: number) {
        this.setStorage(this.liveRangeKey, value ? value.toString() : null);
    }

    constructor(
        private messageService: MessageService
    ) {
        /*

        TODO:
        - styles for input groups
        - remove custom utc calendar?
         */
    }

    /**
     * Sets or removes the key from local storage based on the value
     * @param key   the key to set or remove
     * @param value a string value to set, empty to remove the item
     */
    private setStorage(key: string, value: string): void {
        if (value) {
            localStorage.setItem(key, value);
        } else {
            localStorage.removeItem(key);
        }
    }

    /**
     * Callback for when a normal start/end value is applied
     */
    onDateFilterApply(): void {
        // normal date filter was applied, turn off live mode
        this.liveRange = null;
        this.liveRangeStorage = null;

        // send out the converted date strings
        this.dateFilterSelected.emit({
            start: this.utcStartDate.toISOString(),
            end: this.utcEndDate.toISOString()
        });
        // ensure the live range will be cleared
        this.liveRangeSelected.emit({ hours: null });

        // keep values in sync to local storage
        this.startedStorage = this.utcStartDate.toISOString();
        this.endedStorage = this.utcEndDate.toISOString();

        // make call to emit out the update hook
        this.update();

        if (this.started > this.ended) {
            // TODO validate
            this.messageService.add({severity: 'error', summary: 'Error querying range', detail: 'Provided FROM date is before TO date'});
        }
    }

    private unsubscribe(): void {
        if (this.liveRangeSubscription) {
            this.liveRangeSubscription.unsubscribe();
            this.liveRangeSubscription = null;
        }
    }

    /**
     * Update hook to emit out the start/end dates the parent component should filter on.
     * @param now optional param for now for live range, otherwise will use start/end
     */
    private update(now?: moment.Moment): void {
        if (now) {
            this.updated.emit({
                start: now.clone().subtract(this.liveRange, 'h').toISOString(),
                end: now.toISOString()
            });
        } else {
            this.updated.emit({
                start: this.utcStartDate.toISOString(),
                end: this.utcEndDate.toISOString()
            });
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

            // emit out the live range selection
            this.liveRangeSelected.emit({ hours: this.liveRange });

            // save to local storage
            this.liveRangeStorage = this.liveRange;

            // ensure any timers are cancelled, then start a new one
            this.unsubscribe();
            this.liveRangeSubscription = Observable.timer(0, 10 * 1000)
                .subscribe(() => {
                    // update using now for the base
                    this.update(moment.utc());
                });
        } else {
            // live range was cleared, make sure timers are cleared
            this.unsubscribe();

            // live range not provided, reset the normal start/end filters
            this.startDate = this.utcDateToLocal(this.started);
            this.endDate = this.utcDateToLocal(this.ended);

            // perform the normal date filter
            this.onDateFilterApply();
        }
    }

    ngOnInit() {
        // check if started was provided by the component, then sync to local storage
        // if not provided by component, try pulling it from local storage
        let storageHasStarted = false;
        if (this.started) {
            this.startedStorage = this.started;
        } else {
            this.started = this.startedStorage;
            storageHasStarted = true;
        }

        // same process for ended date
        let storageHasEnded = false;
        if (this.ended) {
            this.endedStorage = this.ended;
        } else {
            this.ended = this.endedStorage;
            storageHasEnded = true;
        }

        // if local storage had both, emit the values back out
        // TODO check if local storage actually got these values before emitting
        if (storageHasStarted && storageHasEnded) {
            this.onDateFilterApply();
        }

        // same for live range value
        if (this.liveRange) {
            this.liveRangeStorage = this.liveRange;
        } else {
            this.liveRange = this.liveRangeStorage;
            if (this.liveRange) {
                this.onLiveRangeChange();
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

    ngOnDestroy() {
        this.unsubscribe();
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
