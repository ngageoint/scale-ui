import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class LogViewerApiService {
    logArgs: any[];

    constructor(
        private http: Http
    ) {
        this.logArgs = [];
    }

    getLogArgs(): any {
        return this.logArgs;
    }
    setLogArgs(args: any[]): void {
        this.logArgs = args;
    }
    getLog(id: number): Promise<any> {
        return this.http.get(`/mocks/job-executions/${id}/logs/combined`)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
