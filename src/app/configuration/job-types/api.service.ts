import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';

import { DataService } from '../../data.service';
import { ApiResults } from '../../api-results.model';
import { JobType } from './api.model';
import { RunningJobsDatatable } from '../../processing/running-jobs/datatable.model';

@Injectable()
export class JobTypesApiService {
    apiPrefix: string;

    constructor(
        private http: Http,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('job-types');
    }

    getJobTypes(params?: any): Promise<ApiResults> {
        let queryParams = {};
        if (params) {
            const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
            const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
            queryParams = {
                order: sortStr,
                page: page,
                page_size: params.rows || 1000,
                started: params.started,
                ended: params.ended,
                name: params.name,
                category: params.category,
                is_active: params.is_active,
                is_operational: params.is_operational
            };
        } else {
            queryParams = {
                page_size: 1000
            };
        }
        return this.http.get(`${this.apiPrefix}/job-types/`, { params: queryParams })
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }

    getJobType(id: number): Promise<JobType> {
        return this.http.get(`${this.apiPrefix}/job-types/${id}/`)
            .toPromise()
            .then(response => JobType.transformer(response.json()))
            .catch(this.handleError);
    }

    validateJobType(jobType: JobType): Promise<any> {
        return this.http.post(`${this.apiPrefix}/job-types/validation/`, jobType)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    updateJobType(jobType: JobType): Promise<any> {
        const updatedJobType = {
            is_paused: jobType.is_paused
        };
        return this.http.patch(`${this.apiPrefix}/job-types/${jobType.id}/`, updatedJobType)
            .toPromise()
            .then(response => JobType.transformer(response.json()))
            .catch(this.handleError);
    }

    getJobTypeStatus(poll?: Boolean): any {
        if (poll) {
            const getData = () => {
                return this.http.get(`${this.apiPrefix}/job-types/status/`)
                    .switchMap((data) => Observable.timer(600000) // 10 minutes
                        .switchMap(() => getData())
                        .startWith(ApiResults.transformer(data.json())))
                    .catch(e => {
                        return Observable.throw(e);
                    });
            };
            return getData();
        }
        return this.http.get(`${this.apiPrefix}/job-types/status/`)
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }

    getRunningJobs(params: RunningJobsDatatable, poll?: Boolean): any {
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        const queryParams = {
            page: page,
            page_size: params.rows
        };
        if (poll) {
            const getData = () => {
                return this.http.get(`${this.apiPrefix}/job-types/running/`, { params: queryParams })
                    .switchMap((data) => Observable.timer(5000)
                        .switchMap(() => getData())
                        .startWith(ApiResults.transformer(data.json())))
                    .catch(e => {
                        return Observable.throw(e);
                    });
            };
            return getData();
        }
        return this.http.get(`${this.apiPrefix}/job-types/running/`, { params: queryParams })
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }

    scanJobTypeWorkspace(params: any): Promise<any> {
        return this.http.patch(`${this.apiPrefix}/job-types/{$params.id}/`, { params: params.trigger_rule })
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
