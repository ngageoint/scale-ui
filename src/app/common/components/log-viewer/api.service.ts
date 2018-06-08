import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';

import { DataService } from '../../services/data.service';
import { catchError } from 'rxjs/internal/operators';

@Injectable()
export class LogViewerApiService {
    apiPrefix: string;
    logArgs: any;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('job-executions');
        this.logArgs = {};
    }

    setLogArgs(args): void {
        this.logArgs = args;
    }
    getLog(id: number, poll?: boolean): any {
        if (poll) {
            const getData = () => {
                return this.http.get(`${this.apiPrefix}/job-executions/${id}/logs/combined/`, { params: this.logArgs })
                    .switchMap((data) => Observable.timer(5000) // 5 seconds
                        .switchMap(() => getData())
                        .startWith(data))
                    .catch(e => {
                        return Observable.throw(e);
                    });
            };
            return getData();
        }
        return this.http.get<any>(`${this.apiPrefix}/job-executions/${id}/logs/combined/`)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }
}
