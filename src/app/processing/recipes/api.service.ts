import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';
import { RecipesDatatable } from './datatable.model';
import { Recipe } from './api.model';

@Injectable()
export class RecipesApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('recipes');
    }

    getRecipes(params: RecipesDatatable, poll?: Boolean): any {
        const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        let apiParams = {
            order: sortStr,
            page: page.toString(),
            page_size: params.rows.toString(),
            started: params.started,
            ended: params.ended,
            type_id: params.type_id.toString(),
            type_name: params.type_name,
            batch_id: params.batch_id.toString(),
            include_superseded: params.include_superseded.toString()
        };
        apiParams = _.pickBy(apiParams, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const queryParams = new HttpParams({
            fromObject: apiParams
        });
        if (poll) {
            const getData = () => {
                return this.http.get(`${this.apiPrefix}/recipes/`, { params: queryParams })
                    .switchMap((data) => Observable.timer(5000)
                        .switchMap(() => getData())
                        .startWith(ApiResults.transformer(data)))
                    .catch(e => {
                        return Observable.throw(e);
                    });
            };
            return getData();
        }
        return this.http.get(`${this.apiPrefix}/recipes/`, { params: queryParams })
            .toPromise()
            .then(response => Promise.resolve(ApiResults.transformer(response)))
            .catch(this.handleError);
    }

    getRecipe(id: number, poll?: Boolean): any {
        if (poll) {
            const getData = () => {
                return this.http.get(`${this.apiPrefix}/recipes/${id}/`)
                    .switchMap((data) => Observable.timer(5000)
                        .switchMap(() => getData())
                        .startWith(Recipe.transformer(data)))
                    .catch(e => {
                        return Observable.throw(e);
                    });
            };
            return getData();
        }
        return this.http.get(`${this.apiPrefix}/recipes/${id}/`)
            .toPromise()
            .then(response => Promise.resolve(Recipe.transformer(response)))
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
