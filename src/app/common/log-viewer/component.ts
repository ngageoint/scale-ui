import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { JobExecution } from '../../processing/jobs/execution.model';
import { LogViewerApiService } from './api.service';

import * as _ from 'lodash';

@Component({
    selector: 'app-log-viewer',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class LogViewerComponent implements OnInit, OnChanges {
    @Input() height: number;
    @Input() execution: JobExecution;
    // forceScroll = true;
    execLog: any[];
    jobLogError: string;
    jobLogErrorStatus: string;
    latestScaleOrderNum = 0;

    constructor(
        private logViewerApiService: LogViewerApiService
    ) {
        this.execLog = [];
    }

    showExeError(errorPanel) {
        if (this.execution.status === 'FAILED') {
            errorPanel.show();
        }
    }

    hideExeError(errorPanel) {
        if (this.execution.status === 'FAILED') {
            errorPanel.hide();
        }
    }

    ngOnChanges(changes) {
        console.log(changes);
        if (this.execution) {
            this.logViewerApiService.getLog(this.execution.id).then((result) => {
                if (result.status !== 204) {
                    // // Content was returned, so add it to the log array
                    // // get difference of max scroll length and current scroll length.var  = result.data;
                    // var div = $($element[0]).find('.bash');
                    // vm.scrollDiff = (div.scrollTop() + div.prop('offsetHeight')) - div.prop('scrollHeight');
                    // if (vm.scrollDiff >= 0) {
                    //     vm.forceScroll = true;
                    // }
                    // concat new content and sort log array by timestamp and then by order num
                    this.execLog = _.sortBy(this.execLog.concat(result.hits.hits), ['_source.@timestamp', '_source.scale_order_num']);
                    if (this.execLog && this.execLog.length > 0) {
                        const lastLog = _.last(this.execLog)._source;
                        if (lastLog.scale_order_num !== this.latestScaleOrderNum) {
                            // new entries, so leave them on the array and report the new timestamp
                            console.log('New entries - ' + lastLog.scale_order_num + ' : ' + this.latestScaleOrderNum);
                            this.latestScaleOrderNum = lastLog.scale_order_num;
                            this.logViewerApiService.setLogArgs([
                                {
                                    started: lastLog['@timestamp']
                                }
                            ]);
                        } else {
                            // duplicate entries, so remove them from the array
                            console.log('Duplicate entries');
                            this.execLog = _.take(this.execLog, this.execLog.length - result.hits.hits.length);
                        }
                    }
                }
            }, (error) => {
                if (error.statusText && error.statusText !== '') {
                    this.jobLogErrorStatus = error.statusText;
                }
                this.jobLogError = 'Unable to retrieve job logs.';
            });
        }
    }

    ngOnInit() {
        this.logViewerApiService.setLogArgs([]);
    }
}
