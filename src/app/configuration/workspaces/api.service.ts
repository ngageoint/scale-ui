import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';

@Injectable()
export class WorkspacesApiService {
    apiPrefix: string;

    constructor(
        private http: Http,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('workspaces');
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
        return this.http.get(`${this.apiPrefix}/workspaces/`, { params: queryParams })
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
