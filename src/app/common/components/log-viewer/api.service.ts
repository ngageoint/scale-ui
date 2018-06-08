import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';

import { DataService } from '../../services/data.service';

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
        return this.http.get(`${this.apiPrefix}/job-executions/${id}/logs/combined/`)
            .toPromise()
            .then(response => Promise.resolve(response))
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
