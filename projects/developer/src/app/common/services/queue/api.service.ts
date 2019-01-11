import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';

import polling from 'rx-polling';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

import { DataService } from '../data.service';
import { ApiResults } from '../../models/api-results.model';

@Injectable({
    providedIn: 'root'
})
export class QueueApiService {
    apiPrefix: string;
    loadApiPrefix: string;
    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('queue');
        this.loadApiPrefix = this.dataService.getApiPrefix('load');
    }

    getLoad(params: any, poll?: boolean): Observable<ApiResults> {
        const queryParams = new HttpParams({
            fromObject: _.pickBy(params, d => {
                return d !== null && typeof d !== 'undefined' && d !== '';
            })
        });
        if (poll) {
            const request = this.http.get(`${this.apiPrefix}/load/`, { params: queryParams })
                .pipe(
                    map(response => {
                        return ApiResults.transformer(response);
                    }),
                    catchError(this.dataService.handleError)
                );
            return polling(request, { interval: 600000 });
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/load/`, {params: queryParams})
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }
}
