import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/internal/operators';

import { DataService } from '../../common/services/data.service';

@Injectable()
export class StatusApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('status');
    }

    getStatus(poll?: boolean): any {
        if (poll) {
            const getData = () => {
                return this.http.get(`${this.apiPrefix}/status/`)
                    .switchMap((data) => Observable.timer(300000) // 5 minutes
                        .switchMap(() => getData())
                        .startWith(data))
                    .catch(e => {
                        return Observable.throw(e);
                    });
            };
            return getData();
        }
        return this.http.get<any>(`${this.apiPrefix}/status/`)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }
}
