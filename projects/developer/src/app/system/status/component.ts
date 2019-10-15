import { Component, OnDestroy, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { StatusService } from '../../common/services/status.service';

@Component({
    selector: 'dev-system-status',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class SystemStatusComponent implements OnInit, OnDestroy {
    subscription: any;
    statuses: any;
    scheduler: any;
    schedulerClass: string;
    schedulerIcon: string;
    constructor(
        private statusService: StatusService
    ) {
        const status = this.statusService.getStatus();
        this.statuses = status && status.statuses ? status.statuses : null;
        this.scheduler = status && status.data ? status.data.scheduler : null;
        this.formatScheduler();
    }

    private formatScheduler() {
        if (this.scheduler) {
            this.scheduler.warnings = _.orderBy(this.scheduler.warnings, ['last_updated'], ['desc']);
            if (this.scheduler.state.name === 'READY') {
                this.schedulerClass = 'label label-success';
                this.schedulerIcon = 'fa fa-check-circle';
            } else if (this.scheduler.state.name === 'PAUSED') {
                this.schedulerClass = 'label label-paused';
                this.schedulerIcon = 'fa fa-pause';
            } else {
                this.schedulerClass = 'label label-default';
                this.schedulerIcon = 'fa fa-circle';
            }
        }
    }

    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.subscription = this.statusService.statusUpdated.subscribe(data => {
            this.statuses = data.dependencies;
            _.forEach(data.dependencies, (dependent,key) => {
                this.statuses = {
                    title: key,
                    description: dependent.detail.msg
                };
            });
            // this.scheduler = data.data.scheduler;
            // this.formatScheduler();
        });
    }

    ngOnDestroy() {
        this.unsubscribe();
    }
}
