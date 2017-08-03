import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { ApiResults } from '../../api-results.model';
import { JobsDatatable } from './datatable.model';

@Injectable()
export class JobsApiService {
    constructor(
        private http: Http
    ) { }
    getJobs(params: JobsDatatable): Promise<ApiResults> {
        // let sortStr = sortOrder < 0 ? '-' + sortField : sortField;
        // return this.http.get('http://scale.dcos.aisohio.net/service/scale/api/v5/jobs/?ended=2017-07-24T23:59:59.999Z&order=' +
        //         sortStr +
        //         '&page=1&page_size=25&started=2017-07-17T00:00:00.000Z')
        return this.http.get('./assets/mock-jobs.json')
            .toPromise()
            .then(response => response.json() as ApiResults)
            .catch(this.handleError);
    }
    getJob(id: number): Promise<ApiResults> {
        return this.http.get('./assets/mock-jobs.json')
            .toPromise()
            .then(response => response.json() as ApiResults)
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
