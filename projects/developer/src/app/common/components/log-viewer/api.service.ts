import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import polling from 'rx-polling';

import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

import { DataService } from '../../services/data.service';

@Injectable()
export class LogViewerApiService {
    apiPrefix: string;
    logArgs: any;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('job-executions');
        this.logArgs = {};
    }

    setLogArgs(args): void {
        this.logArgs = args;
    }
    getLog(id: number, poll?: boolean): Observable<any> {
        if (poll) {
            const request = this.http.get(`${this.apiPrefix}/job-executions/${id}/logs/combined/`, { params: this.logArgs })
                .pipe(
                    catchError(this.dataService.handleError)
                );
            return polling(request, { interval: 5000 });
        }
        return this.http.get<any>(`${this.apiPrefix}/job-executions/${id}/logs/combined/`)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }
}
