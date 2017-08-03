import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { ApiResults } from '../api-results.model';


@Injectable()
export class DashboardApiService {

    constructor(private http: Http) {
    }

    getJobLoad(): Promise<ApiResults> {
        return this.http.get('/mocks/jobload')
            .toPromise()
            .then(response => response.json() as ApiResults)
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
