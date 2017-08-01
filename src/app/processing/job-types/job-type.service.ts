import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { ApiResults } from '../../api-results.model';

@Injectable()
export class JobTypeService {
    constructor(
        private http: Http
    ) { }
    getJobTypes(params: object): Promise<ApiResults> {
        return this.http.get('./assets/mock-job-types.json')
            .toPromise()
            .then(response => response.json() as ApiResults)
            .catch(this.handleError);
    }
    getJobType(id: number): Promise<ApiResults> {
        return this.http.get('./assets/mock-job-types.json')
            .toPromise()
            .then(response => response.json().results as ApiResults)
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
