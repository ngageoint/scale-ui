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
    @Input() show6hButton = true;
    @Input() show12hButton = true;
    @Input() show24hButton = true;
    @Input() show3dButton = true;
    @Input() show7dButton = true;
    @Output() dateFilterApply: EventEmitter<any> = new EventEmitter();
    @Output() dateRangeSelected: EventEmitter<any> = new EventEmitter();
    dateFormat = environment.dateFormat;
    dateRangeOptions = [];
    selectedDateRange: any;
    applyBtnClass = 'ui-button-secondary';
    isMobile: boolean;

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
        this.breakpointObserver.observe(['(min-width: 1275px)']).subscribe((state: BreakpointState) => {
            this.isMobile = !state.matches;
        });
        if (this.show6hButton) this.dateRangeOptions.push({ label: 'Last 6 Hours', value: { unit: 'h', range: 6 } });
        if (this.show12hButton) this.dateRangeOptions.push({ label: 'Last 12 Hours', value: { unit: 'h', range: 12 } });
        if (this.show24hButton) this.dateRangeOptions.push({ label: 'Last 24 Hours', value: { unit: 'h', range: 24 } });
        if (this.show3dButton) this.dateRangeOptions.push({ label: 'Last 3 Days', value: { unit: 'h', range: 3 } });
        if (this.show7dButton) this.dateRangeOptions.push({ label: 'Last 7 Days', value: { unit: 'h', range: 7 } });
    }
}
