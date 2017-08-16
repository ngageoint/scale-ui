import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { ApiResults } from '../../api-results.model';
import { JobTypesDatatable } from './datatable.model';
import { JobType } from './api.model';

@Injectable()
export class JobTypesApiService {
    constructor( private http: Http) {
    }

    getJobTypes(params?: JobTypesDatatable): Promise<ApiResults> {
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
        return this.http.get('/mocks/job-types', { params: queryParams })
            .toPromise()
            .then(response => response.json() as ApiResults)
            .catch(this.handleError);
    }

    getJobType(id: number): Promise<JobType> {
        return this.http.get('/mocks/job-types/' + id)
            .toPromise()
            .then(response => response.json() as JobType)
            .catch(this.handleError);
    }

    validateJobType(jobType: JobType): Promise<ApiResults> {
        return this.http.post('/mocks/job-types/validate', jobType)
            .toPromise()
            .then(response => response.json() as ApiResults)
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
