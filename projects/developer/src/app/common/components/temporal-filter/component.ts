import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import { Subscription, Observable } from 'rxjs';
import 'rxjs/add/observable/timer';
import * as moment from 'moment';

import { LocalStorageItem } from '../../utils/localstorage';
import { UTCDates } from '../../utils/utcdates';

@Component({
    selector: 'dev-temporal-filter',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class TemporalFilterComponent implements OnInit, OnDestroy {
    @Input() started: string;
    @Input() ended: string;
    @Input() liveRange: number;
    @Input() loading = false;
    @Input() localStorageKey = 'temporal-filter';
    @Input() liveRangeOnly = false;
    @Input() refreshRate = 10;

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
    // when the live range dropdown value is selected or cleared
    @Output() liveRangeSelected: EventEmitter<{hours: number}> = new EventEmitter();
    // when the parent component should make an api call to update the data
    // driven by the timer for the live range update, as well as normal start/end date filter apply
    @Output() updated: EventEmitter<{start: string, end: string}> = new EventEmitter();

    selectedDateRange: any;
    applyBtnClass = 'ui-button-secondary';
    applyStatusClass = 'live-range-inactive';
    applyTxtClass = '';
    liveRangeTooltip = 'No Live Range Selected';
    // internal dates for this component
    startDate: Date;
    endDate: Date;

    // timer subscription, firing when a live range should be changed
    private liveRangeSubscription: Subscription;

    // year range to show in the calendar dropdown
    get yearRange(): string {
        const now = moment();
        const start = now.clone().subtract(20, 'y').year();
        const end = now.clone().add(5, 'y').year();
        return `${start}:${end}`;
    }

    // dynamic css class to use for live range icon
    get liveRangeIconClass(): string {
        if (this.isLiveMode) {
            if (this.loading) {
                return 'fa-circle-o-notch fa-spin';
            } else {
                return 'fa-circle live-range-active';
            }
        }
        return 'fa-circle live-range-inactive';
    }

    // utc versions of internal start and end dates
    get utcStartDate(): Date { return UTCDates.localDateToUTC(this.startDate); }
    get utcEndDate(): Date { return UTCDates.localDateToUTC(this.endDate); }

    // helper for if a live range is selected
    get isLiveMode(): boolean { return !!this.liveRange; }

    // used for saving started value into local storage
    private startedStorage: LocalStorageItem;

    // used for saving ended value into local storage
    private endedStorage: LocalStorageItem;

    // used for saving live range value into local storage
    private liveRangeStorage: LocalStorageItem;

    // determines if the form inputs are valid
    get isValid(): boolean {
        if (!this.isLiveMode) {
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
        // normal date filter was applied, turn off live mode
        this.liveRange = null;
        this.liveRangeStorage.remove();
        this.unsubscribe();

        // send out the converted date strings
        this.dateFilterSelected.emit({
            start: this.utcStartDate.toISOString(),
            end: this.utcEndDate.toISOString()
        });
        // ensure the live range will be cleared
        this.liveRangeSelected.emit({ hours: null });

        // keep values in sync to local storage
        this.startedStorage.set(this.utcStartDate.toISOString());
        this.endedStorage.set(this.utcEndDate.toISOString());

        if (this.startDate >= this.endDate) {
            this.messageService.add({severity: 'error', summary: 'Error querying range', detail: 'Provided FROM date is before TO date'});
        } else {
            // make call to emit out the update hook
            this.update();
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
            this.liveRangeStorage.set(this.liveRange);

            // ensure any timers are cancelled, then start a new one
            this.unsubscribe();
            this.liveRangeSubscription = Observable.timer(0, this.refreshRate * 1000)
                .subscribe(() => {
                    // update using now for the base
                    this.update(moment.utc());
                });
        } else {
            // live range was cleared, make sure timers are cleared
            this.unsubscribe();

            // default back to either the supplied start/end date, or from local storage, then from default
            const now = moment();
            const start = this.started || this.startedStorage.get() || now.clone().subtract(1, 'day').toDate();
            const end = this.ended || this.endedStorage.get() || now.toDate();
            this.startDate = UTCDates.utcDateToLocal(start);
            this.endDate = UTCDates.utcDateToLocal(end);

            // perform the normal date filter
            this.onDateFilterApply();
        }
    }

    ngOnInit() {
        // initialize storage with passed in @Input keys
        this.startedStorage = new LocalStorageItem('started', this.localStorageKey);
        this.endedStorage = new LocalStorageItem('ended', this.localStorageKey);
        this.liveRangeStorage = new LocalStorageItem('range', this.localStorageKey);

        // restrict options for in live range only mode
        if (this.liveRangeOnly) {
            this.dateRangeOptions = this.dateRangeOptions.filter(d => d.value);
        }

        // prevent expression changed error
        setTimeout(() => {
            if (this.liveRange) {
                // live range was set from parent (router)
                this.liveRangeStorage.set(this.liveRange);
                this.onLiveRangeChange();
            } else if (!this.liveRangeOnly && this.started && this.ended) {
                // start/end dates were set from parent (router)
                this.startDate = UTCDates.utcDateToLocal(this.started);
                this.endDate = UTCDates.utcDateToLocal(this.ended);
                this.onDateFilterApply();
            } else if (this.liveRangeStorage.get()) {
                // live range and start/end not provided by parent
                // live range available in localstorage
                this.liveRange = this.liveRangeStorage.get();
                this.onLiveRangeChange();
            } else if (this.startedStorage.get() && this.endedStorage.get()) {
                // start/end provided from localstorage
                this.startDate = UTCDates.utcDateToLocal(this.startedStorage.get());
                this.endDate = UTCDates.utcDateToLocal(this.endedStorage.get());
                this.onDateFilterApply();
            } else {
                if (this.liveRangeOnly) {
                    // force using the live range value, provide a default
                    this.liveRange = this.dateRangeOptions[0].value;
                    this.onLiveRangeChange();
                } else {
                    // nothing provided by parent component or found in storage
                    // use date filter on the last day
                    const now = moment();
                    this.endDate = now.toDate();
                    this.startDate = now.clone().subtract(1, 'day').toDate();
                    this.onDateFilterApply();
                }
            }
        });
    }

    ngOnDestroy() {
        this.unsubscribe();
    }

}
