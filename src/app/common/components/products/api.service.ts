import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';

import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/startWith';
import { Observable } from 'rxjs/Observable';
import { catchError, map } from 'rxjs/internal/operators';

import { DataService } from '../../services/data.service';
import { ApiResults } from '../../models/api-results.model';

@Injectable()
export class ProductsApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('products');
    }

    getProducts(params: any, poll?: Boolean): any {
        const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        let apiParams = {
            page: page.toString(),
            page_size: params.rows ? params.rows.toString() : null,
            started: params.started,
            ended: params.ended,
            time_field: params.time_field,
            order: sortStr,
            job_id: params.job_id ? params.job_id.toString() : null,
            job_type_id: params.job_type_id ? params.job_type_id.toString() : null,
            job_type_name: params.job_type_name,
            job_type_category: params.job_type_category,
            batch_id: params.batch_id ? params.batch_id.toString() : null,
            file_name: params.file_name
        };
        apiParams = _.pickBy(apiParams, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const queryParams = new HttpParams({
            fromObject: apiParams
        });
        if (poll) {
            const getData = () => {
                return this.http.get(`${this.apiPrefix}/products/`, { params: queryParams })
                    .switchMap((data) => Observable.timer(600000) // 10 minutes
                        .switchMap(() => getData())
                        .startWith(ApiResults.transformer(data)))
                    .catch(e => {
                        return Observable.throw(e);
                    });
            };
            return getData();
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/products/`, { params: queryParams })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }
}
