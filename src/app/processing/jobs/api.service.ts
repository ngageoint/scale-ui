import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/startWith';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';
import { Job } from './api.model';
import { JobsDatatable } from './datatable.model';
import { JobExecution } from './execution.model';
import { catchError } from 'rxjs/internal/operators';

@Injectable()
export class JobsApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('jobs');
    }

    getJobs(params: JobsDatatable, poll?: Boolean) {
        const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        let apiParams = {
            order: sortStr,
            page: page.toString(),
            page_size: params.rows.toString(),
            started: params.started,
            ended: params.ended,
            status: params.status,
            job_id: params.job_id ? params.job_id.toString() : null,
            job_type_id: params.job_type_id,
            job_type_name: params.job_type_name,
            job_type_category: params.job_type_category,
            batch_id: params.batch_id ? params.batch_id.toString() : null,
            error_category: params.error_category,
            include_superseded: params.include_superseded ? params.include_superseded.toString() : null
        };
        apiParams = _.pickBy(apiParams, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const queryParams = new HttpParams({
            fromObject: apiParams
        });
        if (poll) {
            const getData = () => {
                return this.http.get(`${this.apiPrefix}/jobs/`, { params: queryParams })
                    .switchMap((data) => Observable.timer(600000) // 10 minutes
                        .switchMap(() => getData())
                        .startWith(ApiResults.transformer(data)))
                    .catch(e => {
                        return Observable.throw(e);
                    });
            };
            return getData();
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/jobs/`, { params: queryParams })
            .pipe(
                catchError(this.dataService.handleError)
            )
    }
    getJob(id: number, poll?: Boolean) {
        if (poll) {
            const getData = () => {
                return this.http.get(`${this.apiPrefix}/jobs/${id}/`)
                    .switchMap((data) => Observable.timer(30000) // 30 seconds
                        .switchMap(() => getData())
                        .startWith(Job.transformer(data)))
                    .catch(e => {
                        return Observable.throw(e);
                    });
            };
            return getData();
        }
        return this.http.get<Job>(`${this.apiPrefix}/jobs/${id}/`)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }
    getJobExecutions(id: number): Observable<ApiResults> {
        return this.http.get<ApiResults>(`${this.apiPrefix}/jobs/${id}/executions/`)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }
    getJobExecution(id: number, exe_num: number): Observable<JobExecution> {
        return this.http.get<JobExecution>(`${this.apiPrefix}/jobs/${id}/executions/${exe_num}/`)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }
    getJobInputs(id: number): Observable<ApiResults> {
        return this.http.get<ApiResults>(`${this.apiPrefix}/jobs/${id}/input_files/`)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }
    getJobOutputs(id: number): Observable<ApiResults> {
        const queryParams = new HttpParams({
            fromObject: { job_id: id.toString() }
        });
        return this.http.get<ApiResults>(`${this.apiPrefix}/products/`, { params: queryParams })
            .pipe(
                catchError(this.dataService.handleError)
            );
    }
    updateJob(id: number, data: any): Observable<any> {
        return this.http.patch<any>(`${this.apiPrefix}/jobs/${id}/`, data)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }
    requeueJobs(params): Observable<any> {
        params.url = params.url ? params.url : `${this.apiPrefix}/jobs/requeue/`;
        return this.http.post<any>(params.url, params)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }
    getJobLoad(params, poll?: boolean): any {
        if (poll) {
            const getData = () => {
                return this.http.get(`${this.apiPrefix}/load/`, { params: params })
                    .switchMap((data) => Observable.timer(600000) // 10 minutes
                        .switchMap(() => getData())
                        .startWith(ApiResults.transformer(data)))
                    .catch(e => {
                        return Observable.throw(e);
                    });
            };
            return getData();
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/load/`, { params: params })
            .pipe(
                catchError(this.dataService.handleError)
            );
    }
}
