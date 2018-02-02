import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { ApiResults } from '../../api-results.model';
import { JobType } from './api.model';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../environments/environment';

@Injectable()
export class JobTypesApiService {
    constructor( private http: Http) {
    }

    getJobTypes(params?: any): Promise<ApiResults> {
        let queryParams = {};
        if (params) {
            const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
            const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
            queryParams = {
                order: sortStr,
                page: page,
                page_size: params.rows,
                started: params.started,
                ended: params.ended,
                name: params.name,
                category: params.category,
                is_active: params.is_active,
                is_operational: params.is_operational
            };
        }
        return this.http.get(`${environment.apiPrefix}/job-types`, { params: queryParams })
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }

    getJobType(id: number): Promise<JobType> {
        return this.http.get(`${environment.apiPrefix}/job-types/` + id)
            .toPromise()
            .then(response => JobType.transformer(response.json()))
            .catch(this.handleError);
    }

    validateJobType(jobType: JobType): Promise<any> {
        return this.http.post(`${environment.apiPrefix}/job-types/validate`, jobType)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    updateJobType(jobType: JobType): Promise<any> {
        const updatedJobType = {
            error_mappings: jobType.error_mapping,
            is_paused: jobType.is_paused
        };
        return this.http.patch(`${environment.apiPrefix}/job-types/${jobType.id}`, updatedJobType)
            .toPromise()
            .then(response => JobType.transformer(response.json()))
            .catch(this.handleError);
    }

    getJobTypeStatus(poll?: Boolean): any {
        if (poll) {
            const getData = () => {
                return this.http.get(`${environment.apiPrefix}/job-types/status`)
                    .switchMap((data) => Observable.timer(600000) // 10 minutes
                        .switchMap(() => getData())
                        .startWith(ApiResults.transformer(data.json())));
            };
            return getData();
        }
        return this.http.get(`${environment.apiPrefix}/job-types/status`)
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}

