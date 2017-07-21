import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Job } from './job';

@Injectable()
export class JobService {
    constructor(
        private http: Http
    ) { }
    getJobs(): Promise<Job[]> {
        return this.http.get('./assets/mock-jobs.json')
            .toPromise()
            .then(response => response.json().results as Job[])
            .catch(this.handleError);
    }
    getJob(id: number): Promise<Job> {
        return this.getJobs()
            .then(jobs => jobs.find(job => job.id === id));
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
