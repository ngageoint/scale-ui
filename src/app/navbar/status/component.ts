import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';

import { StatusApiService } from './api.service';

@Component({
    selector: 'app-status',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class StatusComponent implements OnInit, OnDestroy {
    subscription: any;
    loading: boolean;
    status: any;
    pctCpu: number;
    pctMem: number;
    pctDisk: number;

    constructor(
        private messageService: MessageService,
        private statusApiService: StatusApiService
    ) { }

    private getCpuUsage() {
        if (this.status.resources.scheduled.cpus && this.status.resources.total.cpus) {
            if (this.status.resources.total.cpus > 0) {
                return +((this.status.resources.scheduled.cpus / this.status.resources.total.cpus) * 100).toFixed(2);
            }
        }
        return 0.00;
    }

    private getMemUsage() {
        if (this.status.resources.scheduled.mem && this.status.resources.total.mem) {
            if (this.status.resources.total.mem > 0) {
                return +((this.status.resources.scheduled.mem / this.status.resources.total.mem) * 100).toFixed(2);
            }
        }
        return 0.00;
    }

    private getDiskUsage() {
        if (this.status.resources.scheduled.disk && this.status.resources.total.disk) {
            if (this.status.resources.total.disk > 0) {
                return +((this.status.resources.scheduled.disk / this.status.resources.total.disk) * 100).toFixed(2);
            }
        }
        return 0.00;
    }

    private getStatus() {
        this.loading = true;
        this.unsubscribe();
        this.subscription = this.statusApiService.getStatus(true).subscribe(data => {
            this.loading = false;
            this.status = data;
            this.pctCpu = this.getCpuUsage();
            this.pctMem = this.getMemUsage();
            this.pctDisk = this.getDiskUsage();
        }, err => {
            this.loading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving system status', detail: err.statusText});
        });
    }

    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.getStatus();
    }

    ngOnDestroy() {
        this.unsubscribe();
    }
}
