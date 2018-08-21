import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';

import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

import { DataService } from '../data.service';
import { ApiResults } from '../../models/api-results.model';

@Injectable()
export class StrikesApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('products');
    }

    getStrikes(params?: any): Observable<ApiResults> {
        const sortStr = params ? params.sortOrder < 0 ? '-' + params.sortField : params.sortField : null;
        const page = params && params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        let apiParams = {
            page: page.toString(),
            page_size: params && params.rows ? params.rows.toString() : null,
            started: params ? params.started : null,
            ended: params ? params.ended : null,
            name: params ? params.name : null,
            order: sortStr
        };
        apiParams = _.pickBy(apiParams, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const queryParams = new HttpParams({
            fromObject: apiParams
        });
        return this.http.get<ApiResults>(`${this.apiPrefix}/strikes/`, { params: queryParams })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }
}
