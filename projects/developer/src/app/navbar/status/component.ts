import { Component, OnInit, OnDestroy, OnChanges, Input, SimpleChanges } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';

import { StatusService } from '../../common/services/status.service';
import { StatusApiService } from '../../system/status/api.service';

@Component({
    selector: 'dev-status',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class StatusComponent implements OnInit, OnDestroy, OnChanges {
    @Input() schedulerIsPaused: boolean;
    subscription: any;
    loading: boolean;
    status: any;
    pctCpu: number;
    pctMem: number;
    pctDisk: number;
    pctGpu: number;

    constructor(
        private messageService: MessageService,
        private statusService: StatusService,
        private statusApiService: StatusApiService
    ) {}

    private getUsage(metric) {
        if (metric) {
            const adjustedTotal = metric.total - metric.unavailable;
            if (adjustedTotal > 0 && metric.running > 0) {
                return +((metric.running / adjustedTotal) * 100).toFixed(2);
            }
            return 0.00;
        }
        return 0.00;
    }

    private getStatus() {
        this.loading = true;
        this.unsubscribe();
        this.subscription = this.statusApiService.getStatus(true).subscribe(data => {
            this.loading = false;
            this.statusService.setStatus(data);
            if (data) {
                this.status = data;
                this.pctCpu = this.getUsage(this.status.resources.cpus);
                this.pctMem = this.getUsage(this.status.resources.mem);
                this.pctDisk = this.getUsage(this.status.resources.disk);
                this.pctGpu = this.getUsage(this.status.resources.gpus);
            } else {
                this.messageService.add({severity: 'warn', summary: 'System Status', detail: 'System status is unavailable.'});
            }
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

    ngOnChanges(changes: SimpleChanges) {
        if (changes.schedulerIsPaused && changes.schedulerIsPaused.currentValue) {
            this.getStatus();
        }
    }
}
