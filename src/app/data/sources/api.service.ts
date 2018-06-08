import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';

import { Observable } from 'rxjs/Observable';
import { catchError, map } from 'rxjs/internal/operators';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';
import { Source } from './api.model';
import { SourcesDatatable } from './datatable.model';

@Injectable()
export class SourcesApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('sources');
    }
    getSources(params: SourcesDatatable): Observable<ApiResults> {
        const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        let apiParams = {
            order: sortStr,
            page: page.toString(),
            page_size: params.rows ? params.rows.toString() : null,
            started: params.started,
            ended: params.ended,
            time_field: params.time_field,
            is_parsed: params.is_parsed,
            file_name: params.file_name
        };
        apiParams = _.pickBy(apiParams, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const queryParams = new HttpParams({
            fromObject: apiParams
        });

        return this.http.get<ApiResults>(`${this.apiPrefix}/sources/`, { params: queryParams })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }
    getSource(id: number): Observable<any> {
        return this.http.get<Source>(`${this.apiPrefix}/sources/${id}/`)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }
    getSourceDescendants(id: number, type: string, params: any): Observable<ApiResults> {
        const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        let apiParams = {
            order: sortStr,
            page: page.toString(),
            page_size: params.rows ? params.rows.toString() : null,
            started: params.started,
            ended: params.ended,
            status: params.status,
            job_id: params.job_id ? params.job_id.toString() : null,
            job_type_id: params.job_type_id ? params.job_type_id.toString() : null,
            job_type_name: params.job_type_name,
            job_type_category: params.job_type_category,
            error_category: params.error_category,
            include_superseded: params.include_superseded ? params.include_superseded.toString() : null
        };
        apiParams = _.pickBy(apiParams, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const queryParams = new HttpParams({
            fromObject: apiParams
        });
        return this.http.get<ApiResults>(`${this.apiPrefix}/sources/${id}/${type}/`, { params: queryParams })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }
}
