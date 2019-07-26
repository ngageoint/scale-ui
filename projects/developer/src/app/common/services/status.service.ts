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
        this.status = data;
        this.statusUpdated.emit(this.status);
    }
}
