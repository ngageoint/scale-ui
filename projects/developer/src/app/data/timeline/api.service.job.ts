import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import polling from 'rx-polling';
import * as _ from 'lodash';

import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';
import { Job } from '../../processing/jobs/api.model';
import { JobsDatatable } from '../../processing/jobs/datatable.model';
import { JobExecution } from '../../processing/jobs/execution.model';

@Injectable({
    providedIn: 'root'
})
export class JobsApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient
    ) {
        this.apiPrefix = DataService.getApiPrefix('jobs');
    }

    getJobs(params?: any): Observable<any> {
        let apiParams = {};
        if (params) {
        const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
            apiParams = {
            order: sortStr,
            page: page.toString(),
            page_size: params.rows ? params.rows.toString() : null,
            started: params.started,
            ended: params.ended,
            status: params.status,
            job_id: params.job_id ? params.job_id.toString() : null,
            job_type_name: params.job_type_name,
            job_type_version: params.job_type_version,
            job_type_category: params.job_type_category,
            batch_id: params.batch_id ? params.batch_id.toString() : null,
            error_category: params.error_category,
            include_superseded: params.include_superseded ? params.include_superseded.toString() : null
        };
    } else {
        apiParams = {
        page_size: 1000,
        is_active: true
        };
    }
        apiParams = _.pickBy(apiParams, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const queryParams = new HttpParams({
            fromObject: apiParams
        });
        return this.http.get<ApiResults>(`${this.apiPrefix}/jobs/`, { params: queryParams })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }
    getJob(id: number, poll?: Boolean): Observable<any> {
        if (poll) {
            const request = this.http.get(`${this.apiPrefix}/jobs/${id}/`)
                .pipe(
                    map(response => {
                        return Job.transformer(response);
                    }),
                    catchError(DataService.handleError)
                );
            return polling(request, { interval: 600000, attempts: 0 });
        }
        return this.http.get<Job>(`${this.apiPrefix}/jobs/${id}/`)
            .pipe(
                map(response => {
                    return Job.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }
    getJobExecutions(id: number): Observable<ApiResults> {
        return this.http.get<ApiResults>(`${this.apiPrefix}/jobs/${id}/executions/`)
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }
    getJobExecution(id: number, exe_num: number): Observable<any> {
        return this.http.get<JobExecution>(`${this.apiPrefix}/jobs/${id}/executions/${exe_num}/`)
            .pipe(
                map(response => {
                    return JobExecution.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }
    getJobInputs(id: number): Observable<ApiResults> {
        return this.http.get<ApiResults>(`${this.apiPrefix}/jobs/${id}/input_files/`)
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }
    getJobOutputs(id: number): Observable<ApiResults> {
        const queryParams = new HttpParams({
            fromObject: { job_id: id.toString(), sortField: 'last_modified', sortOrder: 'desc' }
        });
        const apiPrefix = DataService.getApiPrefix('files');
        return this.http.get<ApiResults>(`${apiPrefix}/files/`, { params: queryParams })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }
    updateJob(id: number, data: any): Observable<any> {
        return this.http.patch<any>(`${this.apiPrefix}/jobs/${id}/`, data)
            .pipe(
                catchError(DataService.handleError)
            );
    }
    requeueJobs(params): Observable<any> {
        params.url = params.url ? params.url : `${this.apiPrefix}/jobs/requeue/`;
        return this.http.post<any>(params.url, params)
            .pipe(
                catchError(DataService.handleError)
            );
    }
    cancelJobs(params): Observable<any> {
        params.url = params.url ? params.url : `${this.apiPrefix}/jobs/cancel/`;
        return this.http.post<any>(params.url, params)
            .pipe(
                catchError(DataService.handleError)
            );
    }
}
