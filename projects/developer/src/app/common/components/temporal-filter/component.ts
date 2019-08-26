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
    isMobile: boolean;

    constructor(
        public breakpointObserver: BreakpointObserver,
        private messageService: MessageService,
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

    shareLink(event) {
        document.addEventListener('copy', (e: ClipboardEvent) => {
            e.clipboardData.setData('text/plain', (location.href));
            e.preventDefault();
            document.removeEventListener('copy', null);
          });
          document.execCommand('copy');
          this.messageService.add({
            severity: 'info',
            summary: 'Copy Successful',
            detail: 'Link to specific URL has been copied.'
        });
    }

    ngOnInit() {
        this.breakpointObserver.observe(['(min-width: 1275px)']).subscribe((state: BreakpointState) => {
            this.isMobile = !state.matches;
        });
    }
}
