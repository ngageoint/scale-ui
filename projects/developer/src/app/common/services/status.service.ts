import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class StatusService {
    @Output() statusUpdated: EventEmitter<any> = new EventEmitter();
    status: any;
    constructor() {
    }

    getStatus() {
        return this.status;
    }

    setStatus(data) {
        this.status = {
            data: data,
            statuses: {}
        };
        if (data) {
            this.status.statuses = {
                scheduler: {
                    label: 'Scheduler',
                    styleClass: 'system-status__healthy fa fa-check-circle',
                    data: data.scheduler ? data.scheduler : null
                },
                system: {
                    label: 'System',
                    styleClass: 'system-status__healthy fa fa-check-circle',
                    data: data.system ? data.system : null
                },
                vault: {
                    label: 'Vault',
                    styleClass: 'system-status__healthy fa fa-check-circle',
                    data: data.vault ? data.vault : null
                }
            };
        }
        this.statusUpdated.emit(this.status);
    }
}
