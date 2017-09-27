import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { ApiResults } from '../api-results.model';
import { JobType } from '../configuration/job-types/api.model';


@Injectable()
export class DashboardApiService {
    constructor( private http: Http) {
    }

    getJobTypesAndStatus(): Promise<ApiResults> {
        return this.http.get('/mocks/job-types/status')
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }

    getJobType(id: number): Promise<JobType> {
        return this.http.get('/mocks/job-types/' + id)
            .toPromise()
            .then(response => JobType.transformer(response.json()))
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
