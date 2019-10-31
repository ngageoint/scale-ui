import { Component, OnDestroy, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { StatusService } from '../../common/services/status.service';
import { StatusApiService } from './api.service';

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
        private statusService: StatusService,
        private statusApiService: StatusApiService
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

    getStatus(data) {
        _.forEach(data.dependencies, (dependent, key) => {
            const warningTypes = [];
            _.forEach(dependent.warnings, (warning) => {
                _.forEach(warning, (warningMessage, warningType) => {
                    warningTypes.push({
                        warningType: warningType,
                        warningMessage: warningMessage
                    });
                });
            });
            if (dependent.OK === true) {
                this.statuses.push({
                    title: key,
                    description: dependent.detail.msg,
                    ok: dependent.OK,
                    details: dependent.detail,
                    warnings: warningTypes,
                    styleClass: 'system-status__healthy',
                    icon: 'fa fa-check'
                });
            } else {
                const errorTypes = [];
                _.forEach(dependent.errors, (error) => {
                    _.forEach(error, (errorMessage, errorType) => {
                        errorTypes.push({
                            errorType: errorType,
                            errorMessage: errorMessage
                        });
                    });
                });
                this.statuses.push({
                    title: key,
                    description: dependent.detail.msg,
                    ok: dependent.OK,
                    details: dependent.detail,
                    errors: errorTypes,
                    warnings: warningTypes ? warningTypes : [],
                    styleClass: 'system-status__unhealthy',
                    icon: 'fa fa-warning'
                });
            }
        });
    }

    ngOnInit() {
        if (_.isEmpty(this.statuses)) {
            this.subscription = this.statusApiService.getStatus().subscribe(data => {
                this.statuses = [];
                this.getStatus(data);
            });
        }
        this.subscription = this.statusService.statusUpdated.subscribe(data => {
            this.statuses = [];
            this.getStatus(data);
        });
    }

    ngOnDestroy() {
        this.unsubscribe();
    }
}
