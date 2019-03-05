import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import polling from 'rx-polling';
import * as _ from 'lodash';

import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';
import { Strike } from './api.model';

@Injectable({
    providedIn: 'root'
})
export class StrikesApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('strikes');
    }

    getStrikes(params?: any, poll?: boolean): Observable<any> {
        let queryParams: any = {
            page: 1,
            page_size: 1000
        };
        if (params) {
            const sortStr = params.sortOrder < 0 ? `-${params.sortField}` : params.sortField;
            const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
            queryParams = {
                order: sortStr || null,
                page: page || 1,
                page_size: params.rows || 1000,
                started: params.started || null,
                ended: params.ended || null,
                name: params.name || null
            };
        }
        queryParams = new HttpParams({
            fromObject: _.pickBy(queryParams, d => {
                return d !== null && typeof d !== 'undefined' && d !== '';
            })
        });
        if (poll) {
            const request = this.http.get(`${this.apiPrefix}/strikes/`, { params: queryParams })
                .pipe(
                    map(response => {
                        const returnObj = ApiResults.transformer(response);
                        returnObj.results = Strike.transformer(returnObj.results);
                        return returnObj;
                    }),
                    catchError(this.dataService.handleError)
                );
            return polling(request, { interval: 600000, attempts: 0 });
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/strikes/`, { params: queryParams })
            .pipe(
                map(response => {
                    const returnObj = ApiResults.transformer(response);
                    returnObj.results = Strike.transformer(returnObj.results);
                    return returnObj;
                }),
                catchError(this.dataService.handleError)
            );
    }

    getStrike(id: number): Observable<any> {
        return this.http.get<ApiResults>(`${this.apiPrefix}/strikes/${id}/`)
            .pipe(
                map(response => {
                    return Strike.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }

    validateStrike(strike: any): Observable<any> {
        return this.http.post<any>(`${this.apiPrefix}/strikes/validation/`, strike)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }

    editStrike(id: number, strike: any): Observable<any> {
        return this.http.patch<any>(`${this.apiPrefix}/strikes/${id}/`, strike)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }

    createStrike(strike: any): Observable<any> {
        return this.http.post<any>(`${this.apiPrefix}/strikes/`, strike)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }
}
