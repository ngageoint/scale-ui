import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import polling from 'rx-polling';
import * as _ from 'lodash';

import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';
import { Ingest } from './api.model';
import { IngestDatatable } from './datatable.model';

@Injectable({
    providedIn: 'root'
})
export class IngestApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient
    ) {
        this.apiPrefix = DataService.getApiPrefix('ingests');
    }

    getIngests(params: IngestDatatable, poll?: boolean): Observable<any> {
        const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        let apiParams: any = {
            order: sortStr,
            page: page.toString(),
            page_size: params.rows ? params.rows.toString() : null,
            started: params.started,
            ended: params.ended,
            status: params.status,
            scan_id: params.scan_id ? params.scan_id : null,
            strike_id: params.strike_id ? params.strike_id : null,
            file_name: params.file_name
        };
        apiParams = _.pickBy(apiParams, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const queryParams = new HttpParams({
            fromObject: apiParams
        });
        if (poll) {
            const request = this.http.get(`${this.apiPrefix}/ingests/`, { params: queryParams })
                .pipe(
                    map(response => {
                        return ApiResults.transformer(response);
                    }),
                    catchError(DataService.handleError)
                );
            return polling(request, { interval: 600000, attempts: 0 });
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/ingests/`, { params: queryParams })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }

    getIngest(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiPrefix}/ingests/${id}/`)
            .pipe(
                map(response => {
                    return Ingest.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }

    getIngestStatus(params: any, poll?: boolean, interval?): Observable<any> {
        if (poll) {
            const request = this.http.get(`${this.apiPrefix}/ingests/status/`, { params: params })
                .pipe(
                    map(response => {
                        return ApiResults.transformer(response);
                    }),
                    catchError(DataService.handleError)
                );
            return polling(request, { interval: interval || 600000, attempts: 0 });
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/ingests/status/`, { params: params })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }
}
