import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';

import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

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

    getRecipes(params: RecipesDatatable, poll?: Boolean): Observable<any> {
        const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        let apiParams = {
            order: sortStr,
            page: page.toString(),
            page_size: params.rows ? params.rows.toString() : null,
            started: params.started,
            ended: params.ended,
            type_id: params.type_id ? params.type_id.toString() : null,
            type_name: params.type_name,
            batch_id: params.batch_id ? params.batch_id.toString() : null,
            include_superseded: params.include_superseded ? params.include_superseded.toString() : null
        };
        apiParams = _.pickBy(apiParams, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const queryParams = new HttpParams({
            fromObject: apiParams
        });
        if (poll) {
            const request = this.http.get(`${this.apiPrefix}/recipes/`, { params: queryParams });
            const mapRequest = response => {
                return ApiResults.transformer(response);
            };
            return this.dataService.generatePoll(5000, request, mapRequest);
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/recipes/`, { params: queryParams })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }

    getRecipe(id: number, poll?: Boolean): any {
        if (poll) {
            const request = this.http.get(`${this.apiPrefix}/recipes/${id}/`);
            const mapRequest = response => {
                return Recipe.transformer(response);
            };
            return this.dataService.generatePoll(5000, request, mapRequest);
        }
        return this.http.get<Recipe>(`${this.apiPrefix}/recipes/${id}/`)
            .pipe(
                map(response => {
                    return Recipe.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }
}
