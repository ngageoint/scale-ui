import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { ApiResults } from '../../api-results.model';
import { RecipeTypesDatatable } from './datatable.model';
import { RecipeType } from './api.model';

@Injectable()
export class RecipeTypesApiService {
    constructor( private http: Http) {
    }

    getRecipeTypes(params?: RecipeTypesDatatable): Promise<ApiResults> {
        let queryParams = {};
        if (params) {
            const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
            const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
            queryParams = {
                order: sortStr,
                page: page,
                page_size: params.rows,
                started: params.started,
                ended: params.ended
            };
        }
        return this.http.get('/mocks/recipe-types', { params: queryParams })
            .toPromise()
            .then(response => response.json() as ApiResults)
            .catch(this.handleError);
    }

    getRecipeType(id: number): Promise<RecipeType> {
        return this.http.get('/mocks/recipe-types/' + id)
            .toPromise()
            .then(response => response.json() as RecipeType)
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
