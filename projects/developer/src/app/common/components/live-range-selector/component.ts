import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import 'rxjs/add/observable/timer';
import * as moment from 'moment';

import { LocalStorageItem } from '../../utils/localstorage';

@Component({
    selector: 'dev-live-range-selector',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class LiveRangeSelectorComponent implements OnInit, OnDestroy {
    @Input() liveRange: number;
    @Input() loading = false;
    @Input() localStorageKey = 'temporal-filter';
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

    // when the live range dropdown value is selected or cleared
    @Output() liveRangeSelected: EventEmitter<{hours: number}> = new EventEmitter();
    // when the parent component should make an api call to update the data
    // driven by the timer for the live range update, as well as normal start/end date filter apply
    @Output() updated: EventEmitter<{start: string, end: string}> = new EventEmitter();

    selectedDateRange: any;

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
        if (this.loading) {
            return 'fa-circle-o-notch fa-spin';
        } else {
            return 'fa-circle live-range-active';
        }
    }

    // used for saving live range value into local storage
    private liveRangeStorage: LocalStorageItem;

    constructor(
    ) {
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
    private update(now: moment.Moment): void {
        this.updated.emit({
            start: now.clone().subtract(this.liveRange, 'h').toISOString(),
            end: now.toISOString()
        });
    }

    /**
     * Callback for when the live range model changes to either emit the value or reset the filter range.
     */
    onLiveRangeChange(): void {
        if (this.liveRange) {

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
        }
    }

    ngOnInit() {
        // initialize storage with passed in @Input keys
        this.liveRangeStorage = new LocalStorageItem('range', this.localStorageKey);

        // restrict options for in live range only mode
        this.dateRangeOptions = this.dateRangeOptions.filter(d => d.value);

        // prevent expression changed error
        setTimeout(() => {
            if (this.liveRange) {
                // live range was set from parent (router)
                this.liveRangeStorage.set(this.liveRange);
                this.onLiveRangeChange();
            } else if (this.liveRangeStorage.get()) {
                // live range and start/end not provided by parent
                // live range available in localstorage
                this.liveRange = this.liveRangeStorage.get();
                this.onLiveRangeChange();
            } else {
                // force using the live range value, provide a default
                this.liveRange = this.dateRangeOptions[0].value;
                this.onLiveRangeChange();
            }
        });
    }

    ngOnDestroy() {
        this.unsubscribe();
    }

}
