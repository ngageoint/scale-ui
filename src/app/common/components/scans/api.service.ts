import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';

import 'rxjs/add/operator/toPromise';

import { DataService } from '../../services/data.service';
import { ApiResults } from '../../models/api-results.model';

@Injectable()
export class ScansApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('products');
    }

    getScans(params: any): Promise<any> {
        const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        let apiParams = {
            page: page.toString(),
            page_size: params.rows.toString(),
            started: params.started,
            ended: params.ended,
            name: params.name,
            order: sortStr
        };
        apiParams = _.pickBy(apiParams, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const queryParams = new HttpParams({
            fromObject: apiParams
        });
        return this.http.get(`${this.apiPrefix}/scans/`, { params: queryParams })
            .toPromise()
            .then(response => Promise.resolve(ApiResults.transformer(response)))
            .catch(this.handleError);
    }

    createScan(scan: any): Promise<any> {
        return this.http.post(`${this.apiPrefix}/scans/`, scan)
            .toPromise()
            .then(response => Promise.resolve(response))
            .catch(this.handleError);
    }

    processScan(id: number): Promise<any> {
        return this.http.post(`${this.apiPrefix}/scans/${id}/process/`, { ingest: true })
            .toPromise()
            .then(response => Promise.resolve(response))
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
