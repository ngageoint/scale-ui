import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { catchError, map } from 'rxjs/internal/operators';

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
        return this.http.get<ApiResults>(`${this.apiPrefix}/ingests/`, { params: params })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
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
        return this.http.get<ApiResults>(`${this.apiPrefix}/ingests/status/`, { params: params })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }
}
