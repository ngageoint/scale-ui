import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { ApiResults } from '../../api-results.model';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class IngestApiService {
    constructor(private http: Http) {
    }

    getIngestStatus(params: any, poll?: boolean): any {
        if (poll) {
            const getData = () => {
                return this.http.get('/mocks/ingests/status', { params: params })
                    .switchMap((data) => Observable.timer(600000) // 10 minutes
                        .switchMap(() => getData())
                        .startWith(ApiResults.transformer(data.json())));
            };
            return getData();
        }
        return this.http.get('/mocks/ingests/status', { params: params })
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
