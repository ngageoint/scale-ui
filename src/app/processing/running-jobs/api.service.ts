import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { ApiResults } from '../../api-results.model';
import { RunningJob } from './api.model';
import { RunningJobsDatatable } from './datatable.model';

@Injectable()
export class RunningJobsApiService {
    constructor(
        private http: Http
    ) { }
    getRunningJobs(params: RunningJobsDatatable): Promise<ApiResults> {
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        const queryParams = {
            page: page,
            page_size: params.rows
        };
        return this.http.get('/mocks/running-jobs', { params: queryParams })
            .toPromise()
            .then(response => response.json() as ApiResults)
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
