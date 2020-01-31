import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import polling from 'rx-polling';
import * as _ from 'lodash';

import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';
import { Scan } from './api.model';

@Injectable({
    providedIn: 'root'
})
export class ScansApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient
    ) {
        this.apiPrefix = DataService.getApiPrefix('products');
    }

    getScans(params: any, poll?: boolean): Observable<ApiResults> {
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
            const request = this.http.get(`${this.apiPrefix}/scans/`, { params: queryParams })
                .pipe(
                    map(response => {
                        const returnObj = ApiResults.transformer(response);
                        returnObj.results = Scan.transformer(returnObj.results);
                        return returnObj;
                    }),
                    catchError(DataService.handleError)
                );
            return polling(request, { interval: 600000, attempts: 0 });
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/scans/`, { params: queryParams })
            .pipe(
                map(response => {
                    const returnObj = ApiResults.transformer(response);
                    returnObj.results = Scan.transformer(returnObj.results);
                    return returnObj;
                }),
                catchError(DataService.handleError)
            );
    }

    getScan(id: number): Observable<any> {
        return this.http.get<ApiResults>(`${this.apiPrefix}/scans/${id}/`)
            .pipe(
                map(response => {
                    return Scan.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }

    validateScan(scan: any): Observable<any> {
        const cleanScan = Scan.cleanScan(scan);
        return this.http.post<any>(`${this.apiPrefix}/scans/validation/`, cleanScan)
            .pipe(
                catchError(DataService.handleError)
            );
    }

    editScan(id: number, scan: any): Observable<any> {
        const cleanScan = Scan.cleanScan(scan);
        return this.http.patch<any>(`${this.apiPrefix}/scans/${id}/`, cleanScan)
            .pipe(
                catchError(DataService.handleError)
            );
    }

    createScan(scan: any): Observable<any> {
        const cleanScan = Scan.cleanScan(scan);
        return this.http.post<any>(`${this.apiPrefix}/scans/`, cleanScan)
            .pipe(
                catchError(DataService.handleError)
            );
    }

    processScan(id: number): Observable<any> {
        return this.http.post<any>(`${this.apiPrefix}/scans/${id}/process/`, { ingest: true })
            .pipe(
                catchError(DataService.handleError)
            );
    }

    cancelScan(id: number, scan: any): Observable<any> {
        const cleanScan = Scan.cleanScan(scan);
        return this.http.post<any>(`${this.apiPrefix}/scans/cancel/${id}/`, cleanScan)
            .pipe(
                catchError(DataService.handleError)
            );
    }
}
