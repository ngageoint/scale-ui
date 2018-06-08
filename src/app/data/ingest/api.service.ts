import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';

@Injectable()
export class IngestApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('ingests');
    }

    getIngests(params: any, poll?: boolean): any {
        if (poll) {
            const getData = () => {
                return this.http.get(`${this.apiPrefix}/ingests/`, { params: params })
                    .switchMap((data) => Observable.timer(600000) // 10 minutes
                        .switchMap(() => getData())
                        .startWith(ApiResults.transformer(data)))
                    .catch(e => {
                        return Observable.throw(e);
                    });
            };
            return getData();
        }
        return this.http.get(`${this.apiPrefix}/ingests/`, { params: params })
            .toPromise()
            .then(response => Promise.resolve(ApiResults.transformer(response)))
            .catch(this.handleError);
    }

    getIngestStatus(params: any, poll?: boolean): any {
        if (poll) {
            const getData = () => {
                return this.http.get(`${this.apiPrefix}/ingests/status/`, { params: params })
                    .switchMap((data) => Observable.timer(600000) // 10 minutes
                        .switchMap(() => getData())
                        .startWith(ApiResults.transformer(data)))
                    .catch(e => {
                        return Observable.throw(e);
                    });
            };
            return getData();
        }
        return this.http.get(`${this.apiPrefix}/ingests/status/`, { params: params })
            .toPromise()
            .then(response => Promise.resolve(ApiResults.transformer(response)))
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
