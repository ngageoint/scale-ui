import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';

import { DataService } from '../../data.service';

@Injectable()
export class LogViewerApiService {
    apiPrefix: string;
    logArgs: any[];

    constructor(
        private http: Http,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('job-executions');
        this.logArgs = [];
    }

    getLogArgs(): any {
        return this.logArgs;
    }
    setLogArgs(args: any[]): void {
        this.logArgs = args;
    }
    getLog(id: number, poll?: boolean): any {
        if (poll) {
            const getData = () => {
                return this.http.get(`${this.apiPrefix}/job-executions/${id}/logs/combined/`)
                    .switchMap((data) => Observable.timer(5000) // 5 seconds
                        .switchMap(() => getData())
                        .startWith(data.json()))
                    .catch(e => {
                        return Observable.throw(e);
                    });
            };
            return getData();
        }
        return this.http.get(`${this.apiPrefix}/job-executions/${id}/logs/combined/`)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
