import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { ApiResults } from '../../api-results.model';
import { RecipesDatatable } from './datatable.model';
import { Recipe } from './api.model';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../environments/environment';

@Injectable()
export class RecipesApiService {
    constructor(
        private http: Http
    ) { }
    getRecipes(params: RecipesDatatable, poll?: Boolean): any {
        const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        const queryParams = {
            order: sortStr,
            page: page,
            page_size: params.rows,
            started: params.started,
            ended: params.ended,
            type_id: params.type_id,
            type_name: params.type_name,
            batch_id: params.batch_id,
            include_superseded: params.include_superseded
        };
        if (poll) {
            const getData = () => {
                return this.http.get(`${environment.apiPrefix}/recipes`, { params: queryParams })
                    .switchMap((data) => Observable.timer(5000)
                        .switchMap(() => getData())
                        .startWith(ApiResults.transformer(data.json())));
            };
            return getData();
        }
        return this.http.get(`${environment.apiPrefix}/recipes`, { params: queryParams })
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }

    getRecipe(id: number): Promise<Recipe> {
        return this.http.get(`${environment.apiPrefix}/recipes/` + id)
            .toPromise()
            .then(response => Recipe.transformer(response.json()))
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
