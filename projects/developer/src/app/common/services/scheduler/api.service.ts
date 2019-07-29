import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';

import polling from 'rx-polling';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/internal/operators';

import { DataService } from '../data.service';

@Injectable({
    providedIn: 'root'
})
export class SchedulerApiService {
    apiPrefix: string;
    constructor(
        private http: HttpClient
    ) {
        this.apiPrefix = DataService.getApiPrefix('scheduler');
    }

    getScheduler(poll?: boolean): Observable<any> {
        if (poll) {
            const request = this.http.get(`${this.apiPrefix}/scheduler/`)
                .pipe(
                    catchError(DataService.handleError)
                );
            return polling(request, { interval: 30000, attempts: 0 });
        }
        return this.http.get<any>(`${this.apiPrefix}/scheduler/`)
            .pipe(
                catchError(DataService.handleError)
            );
    }

    updateScheduler(params: any): Observable<any> {
        const queryParams = new HttpParams({
            fromObject: _.pickBy(params, d => {
                return d !== null && typeof d !== 'undefined' && d !== '';
            })
        });
        return this.http.patch(`${this.apiPrefix}/scheduler/`, {params: queryParams})
            .pipe(
                catchError(DataService.handleError)
            );
    }
}
