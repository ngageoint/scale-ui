import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import * as _ from 'lodash';

import 'rxjs/add/operator/toPromise';

import { DataService } from '../../data.service';
import { ApiResults } from '../../api-results.model';

@Injectable()
export class ScansApiService {
    apiPrefix: string;

    constructor(
        private http: Http,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('products');
    }

    getScans(params: any): Promise<any> {
        const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        let queryParams = {
            page: page,
            page_size: params.rows,
            started: params.started,
            ended: params.ended,
            name: params.name,
            order: sortStr
        };
        queryParams = _.pickBy(queryParams, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        return this.http.get(`${this.apiPrefix}/scans/`, { params: queryParams })
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }

    createScan(scan: any): Promise<any> {
        return this.http.post(`${this.apiPrefix}/scans/`, scan)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    processScan(id: number): Promise<any> {
        return this.http.post(`${this.apiPrefix}/scans/${id}/process/`, { ingest: true })
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
