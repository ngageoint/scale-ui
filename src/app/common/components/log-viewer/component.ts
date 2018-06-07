import { Component, Input, OnInit, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';

import { JobExecution } from '../../../processing/jobs/execution.model';
import { LogViewerApiService } from './api.service';

@Component({
    selector: 'app-log-viewer',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class LogViewerComponent implements OnInit, OnChanges, OnDestroy {
    @Input() execution: JobExecution;
    @Input() visible: boolean;
    @ViewChild('codemirror') codemirror: any;
    loading: boolean;
    subscription: any;
    scrollToLine = 1e8;
    execLog: any[];
    execLogStr: string;
    latestScaleOrderNum = 0;
    jsonConfig = {
        mode: {name: 'text/plain', json: false},
        indentUnit: 4,
        lineNumbers: true,
        readOnly: true
    };

    constructor(
        private messageService: MessageService,
        private logViewerApiService: LogViewerApiService
    ) {
        this.execLog = [];
    }

    private fetchLog() {
        this.loading = true;
        this.subscription = this.logViewerApiService.getLog(this.execution.id, true).subscribe(result => {
            this.loading = false;
            if (result && result.status !== 204) {
                this.execLogStr = '';
                // concat new content and sort log array by timestamp and then by order num
                this.execLog = _.sortBy(this.execLog.concat(result.hits.hits), ['_source.@timestamp', '_source.scale_order_num']);
                if (this.execLog && this.execLog.length > 0) {
                    const lastLog = _.last(this.execLog)._source;
                    if (lastLog.scale_order_num !== this.latestScaleOrderNum) {
                        // new entries, so leave them on the array and report the new timestamp
                        console.log('New entries - ' + lastLog.scale_order_num + ' : ' + this.latestScaleOrderNum);
                        this.latestScaleOrderNum = lastLog.scale_order_num;
                        this.logViewerApiService.setLogArgs({
                            started: lastLog['@timestamp']
                        });
                    } else {
                        // duplicate entries, so remove them from the array
                        console.log('Duplicate entries');
                        this.execLog = _.uniqBy(this.execLog, '_source.scale_order_num');
                    }
                }
                _.forEach(this.execLog, line => {
                    this.execLogStr = this.execLogStr.concat(`${line._source['@timestamp']}: ${line._source.message }`);
                });
            } else {
                this.execLogStr = 'Waiting for log output...';
            }
        }, (error) => {
            this.loading = false;
            let errorDetail = '';
            if (error.statusText && error.statusText !== '') {
                errorDetail = error.statusText;
            }
            this.messageService.add({severity: 'error', summary: 'Unable to retrieve execution log', detail: errorDetail});
        });
    }

    showExeError(errorPanel, $event) {
        if (this.execution.status === 'FAILED') {
            errorPanel.show($event);
        }
    }

    hideExeError(errorPanel) {
        if (this.execution.status === 'FAILED') {
            errorPanel.hide();
        }
    }

    onScroll() {
        const rect = this.codemirror.codeMirror.getWrapperElement().getBoundingClientRect();
        const bottomVisibleLine = this.codemirror.codeMirror.lineAtHeight(rect.bottom, 'window');
        this.scrollToLine = bottomVisibleLine < this.codemirror.codeMirror.lineCount() ? bottomVisibleLine - 1 : 1e8;
    }

    onCursorActivity() {
        if (this.codemirror) {
            this.codemirror.codeMirror.focus();
            this.codemirror.codeMirror.setCursor(this.scrollToLine, 0);
        }
    }

    unsubscribe() {
        if (this.subscription) {
            console.log('unsubscribe');
            this.subscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.logViewerApiService.setLogArgs([]);
    }

    ngOnChanges(changes) {
        if (changes.visible && !changes.visible.currentValue) {
            this.unsubscribe();
        } else {
            if (changes.execution) {
                if (changes.execution.previousValue) {
                    if (changes.execution.previousValue.id !== changes.execution.currentValue.id) {
                        this.execLog = [];
                        this.logViewerApiService.setLogArgs({});
                        this.fetchLog();
                    }
                } else if (changes.execution.currentValue) {
                    this.fetchLog();
                }
            }
        }

        if (changes.execution && !_.isEqual(changes.execution.previousValue, changes.execution.currentValue)) {

        }
    }

    ngOnDestroy() {
        this.unsubscribe();
    }
}
