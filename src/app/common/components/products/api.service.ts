import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import * as _ from 'lodash';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/startWith';

import { DataService } from '../../services/data.service';
import { ApiResults } from '../../models/api-results.model';

@Injectable()
export class ProductsApiService {
    apiPrefix: string;

    constructor(
        private http: Http,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('products');
    }

    getProducts(params: any, poll?: Boolean): any {
        const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        let queryParams = {
            page: page,
            page_size: params.rows,
            started: params.started,
            ended: params.ended,
            time_field: params.time_field,
            order: sortStr,
            job_id: params.job_id,
            job_type_id: params.job_type_id,
            job_type_name: params.job_type_name,
            job_type_category: params.job_type_category,
            batch_id: params.batch_id,
            file_name: params.file_name
        };
        queryParams = _.pickBy(queryParams, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        if (poll) {
            const getData = () => {
                return this.http.get(`${this.apiPrefix}/products/`, { params: queryParams })
                    .switchMap((data) => Observable.timer(600000) // 10 minutes
                        .switchMap(() => getData())
                        .startWith(ApiResults.transformer(data.json())))
                    .catch(e => {
                        return Observable.throw(e);
                    });
            };
            return getData();
        }
        return this.http.get(`${this.apiPrefix}/products/`, { params: queryParams })
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
