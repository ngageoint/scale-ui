import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import * as moment from 'moment';

import { environment } from '../../../../environments/environment';

@Component({
    selector: 'dev-temporal-filter',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class TemporalFilterComponent implements OnInit {
    @Input() started: string;
    @Input() ended: string;
    @Input() liveRange: number;
    @Input() loading = false;
    @Input() localStorageKey = 'temporal-filter';
    @Input() liveRangeOnly = false;

    // when the start/end dates are applied
    @Output() dateFilterSelected: EventEmitter<{start: string, end: string}> = new EventEmitter();
    // when the live range dropdown value is selected or cleared
    @Output() liveRangeSelected: EventEmitter<{hours: number}> = new EventEmitter();
    // when the parent component should make an api call to update the data
    // driven by the timer for the live range update, as well as normal start/end date filter apply
    @Output() updated: EventEmitter<{start: string, end: string}> = new EventEmitter();

    // dropdown options for live range, values in hours
    dateRangeOptions = [
        { label: 'Last 6 Hours', value: { unit: 'h', range: 6 } },
        { label: 'Last 12 Hours', value: { unit: 'h', range: 12 } },
        { label: 'Last 24 Hours', value: { unit: 'h', range: 24 } },
        { label: 'Last 3 Days', value: { unit: 'd', range: 3 } },
        { label: 'Last 7 Days', value: { unit: 'd', range: 7 } }
    ];

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
    get utcStartDate(): Date { return this.localDateToUTC(this.startDate); }
    get utcEndDate(): Date { return this.localDateToUTC(this.endDate); }

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
        public breakpointObserver: BreakpointObserver
    ) {}

    onStartSelect(e) {
        this.started = moment.utc(e, this.dateFormat).startOf('d').format(this.dateFormat);
        this.applyBtnClass = 'ui-button-primary';
    }

    onEndSelect(e) {
        this.ended = moment.utc(e, this.dateFormat).endOf('d').format(this.dateFormat);
        this.applyBtnClass = 'ui-button-primary';
    }

    onDateFilterApply() {
        this.applyBtnClass = 'ui-button-secondary';
        this.dateFilterApply.emit({ started: this.started, ended: this.ended });
    }

    setDateFilterRange(unit: any, range: any) {
        this.started = moment.utc().subtract(range, unit).toISOString();
        this.ended = moment.utc().toISOString();
        this.dateRangeSelected.emit({ unit: unit, range: range });
    }
    // Starting to add share link option
    // shareLink(event) {
    //     document.addEventListener('copy', (e: ClipboardEvent) => {
    //         e.clipboardData.setData('text/plain', (event));
    //         e.preventDefault();
    //         document.removeEventListener('copy', null);
    //       });
    //       document.execCommand('copy');
    // }

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
                this.startDate = this.utcDateToLocal(this.started);
                this.endDate = this.utcDateToLocal(this.ended);
                this.onDateFilterApply();
            } else if (this.liveRangeStorage.get()) {
                // live range and start/end not provided by parent
                // live range available in localstorage
                this.liveRange = this.liveRangeStorage.get();
                this.onLiveRangeChange();
            } else if (this.startedStorage.get() && this.endedStorage.get()) {
                // start/end provided from localstorage
                this.startDate = this.utcDateToLocal(this.startedStorage.get());
                this.endDate = this.utcDateToLocal(this.endedStorage.get());
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
}
