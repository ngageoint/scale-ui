import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

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

@Injectable()
export class JobsApiService {
    apiPrefix: string;

    constructor(
        private http: Http,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('jobs');
    }

    getJobs(params: JobsDatatable, poll?: Boolean): any {
        const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        const queryParams = {
            order: sortStr,
            page: page,
            page_size: params.rows,
            started: params.started,
            ended: params.ended,
            status: params.status,
            job_id: params.job_id,
            job_type_id: params.job_type_id,
            job_type_name: params.job_type_name,
            job_type_category: params.job_type_category,
            batch_id: params.batch_id,
            error_category: params.error_category,
            include_superseded: params.include_superseded
        };
        if (poll) {
            const getData = () => {
                return this.http.get(`${this.apiPrefix}/jobs/`, { params: queryParams })
                    .switchMap((data) => Observable.timer(600000) // 10 minutes
                        .switchMap(() => getData())
                        .startWith(ApiResults.transformer(data.json())))
                    .catch(e => {
                        return Observable.throw(e);
                    });
            };
            return getData();
        }
        return this.http.get(`${this.apiPrefix}/jobs/`, { params: queryParams })
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }
    getJob(id: number, poll?: Boolean): any {
        if (poll) {
            const getData = () => {
                return this.http.get(`${this.apiPrefix}/jobs/${id}/`)
                    .switchMap((data) => Observable.timer(30000) // 30 seconds
                        .switchMap(() => getData())
                        .startWith(Job.transformer(data.json())))
                    .catch(e => {
                        return Observable.throw(e);
                    });
            };
            return getData();
        }
        return this.http.get(`${this.apiPrefix}/jobs/${id}/`)
            .toPromise()
            .then(response => Job.transformer(response.json()))
            .catch(this.handleError);
    }
    getJobExecutions(id: number): Promise<any> {
        return this.http.get(`${this.apiPrefix}/jobs/${id}/executions/`)
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }
    getJobExecution(id: number, exe_num: number): Promise<JobExecution> {
        return this.http.get(`${this.apiPrefix}/jobs/${id}/executions/${exe_num}/`)
            .toPromise()
            .then(response => JobExecution.transformer(response.json()))
            .catch(this.handleError);
    }
    getJobInputs(id: number): Promise<any> {
        return this.http.get(`${this.apiPrefix}/jobs/${id}/input_files/`)
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }
    getJobOutputs(id: number): Promise<any> {
        return this.http.get(`${this.apiPrefix}/products/`, { params: { job_id: id } })
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }
    updateJob(id: number, data: any): Promise<any> {
        return this.http.patch(`${this.apiPrefix}/jobs/${id}/`, data)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }
    requeueJobs(params): Promise<any> {
        params.url = params.url ? params.url : `${this.apiPrefix}/jobs/requeue/`;
        return this.http.post(params.url, params)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }
    getJobLoad(params, poll?: boolean): any {
        if (poll) {
            const getData = () => {
                return this.http.get(`${this.apiPrefix}/load/`, { params: params })
                    .switchMap((data) => Observable.timer(600000) // 10 minutes
                        .switchMap(() => getData())
                        .startWith(ApiResults.transformer(data.json())))
                    .catch(e => {
                        return Observable.throw(e);
                    });
            };
            return getData();
        }
        return this.http.get(`${this.apiPrefix}/load/`, { params: params })
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
