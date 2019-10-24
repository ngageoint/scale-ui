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
    @Input() started: string;
    @Input() ended: string;
    @Output() dateFilterApply: EventEmitter<any> = new EventEmitter();
    @Output() dateRangeSelected: EventEmitter<any> = new EventEmitter();
    dateFormat = environment.dateFormat;
    dateRangeOptions = [
        { label: 'Last 6 Hours', value: { unit: 'h', range: 6 } },
        { label: 'Last 12 Hours', value: { unit: 'h', range: 12 } },
        { label: 'Last 24 Hours', value: { unit: 'h', range: 24 } },
        { label: 'Last 3 Days', value: { unit: 'd', range: 3 } },
        { label: 'Last 7 Days', value: { unit: 'd', range: 7 } }
    ];
    selectedDateRange: any;
    applyBtnClass = 'ui-button-secondary';
    applyStatusClass = 'live-range-inactive';
    applyTxtClass = '';
    liveRangeTooltip = 'No Live Range Selected';

    constructor(
        public breakpointObserver: BreakpointObserver,
        private messageService: MessageService
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
        this.applyTxtClass = 'txt-field-active';
        this.applyStatusClass = 'live-range-inactive';
        this.liveRangeTooltip = 'No Live Range Selected';
        this.dateFilterApply.emit({ started: this.started, ended: this.ended });
        if (this.started > this.ended) {
            this.applyTxtClass = 'txt-field-error';
            this.messageService.add({severity: 'error', summary: 'Error querying range', detail: 'Provided FROM date is before TO date'});
        }
    }

    setDateFilterRange(unit: any, range: any) {
        this.applyTxtClass = 'txt-field-inactive';
        this.applyStatusClass = 'live-range-active';
        this.liveRangeTooltip = 'Refreshing every 10 seconds';
        this.started = moment.utc().subtract(range, unit).toISOString();
        this.ended = moment.utc().toISOString();
        this.dateRangeSelected.emit({ unit: unit, range: range });
    }

    ngOnInit() {
        this.selectedDateRange = { unit: 'h', range: 24 } ;
        this.setDateFilterRange('h', 24);
    }
}
