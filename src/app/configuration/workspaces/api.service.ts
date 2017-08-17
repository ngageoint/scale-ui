import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { ApiResults } from '../../api-results.model';

@Injectable()
export class WorkspacesApiService {
    constructor( private http: Http) {
    }

    getWorkspaces(params?: object): Promise<ApiResults> {
        const queryParams = {};
        // if (params) {
        //     const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        //     const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        //     queryParams = {
        //         order: sortStr,
        //         page: page,
        //         page_size: params.rows,
        //         started: params.started,
        //         ended: params.ended,
        //         name: params.name
        //     };
        // }
        return this.http.get('/mocks/workspaces', { params: queryParams })
            .toPromise()
            .then(response => response.json() as ApiResults)
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
