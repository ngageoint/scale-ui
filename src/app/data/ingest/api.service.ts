import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { ApiResults } from '../../api-results.model';

@Injectable()
export class IngestApiService {
    constructor(private http: Http) {
    }

    getIngestStatus(params: any): Promise<ApiResults> {
        return this.http.get('/mocks/ingests/status', params)
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
