import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';

import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';
import { RecipeType } from './api.model';

@Injectable({
    providedIn: 'root'
})
export class RecipeTypesApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient
    ) {
        this.apiPrefix = DataService.getApiPrefix('recipe-types');
    }

    getRecipeTypes(params?: any): Observable<ApiResults> {
        let apiParams = {};
        if (params) {
            const sortStr = params.sortField ? params.sortOrder < 0 ? '-' + params.sortField : params.sortField : null;
            const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
            const isActive = params.is_active === true || params.is_active === false || params.is_active === null ? params.is_active : true;
            apiParams = {
                order: sortStr,
                page: page,
                page_size: params.rows ? params.rows : 1000,
                started: params.started || null,
                ended: params.ended || null,
                keyword: params.keyword || null,
                is_active: isActive,
                is_system: params.is_system || null
            };
        } else {
            apiParams = {
                page_size: 1000,
                is_active: true
            };
        }
        apiParams = _.pickBy(apiParams, d => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const queryParams = new HttpParams({
            fromObject: apiParams
        });
        return this.http.get<ApiResults>(`${this.apiPrefix}/recipe-types/`, { params: queryParams })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }

    getRecipeType(name: string): Observable<any> {
        return this.http.get<RecipeType>(`${this.apiPrefix}/recipe-types/${name}/`)
            .pipe(
                map(response => {
                    return RecipeType.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }

    validateRecipeType(recipeType: any): Observable<any> {
        return this.http.post<any>(`${this.apiPrefix}/recipe-types/validation/`, recipeType)
            .pipe(
                catchError(DataService.handleError)
            );
    }

    createRecipeType(recipeType: any): Observable<any> {
        return this.http.post<any>(`${this.apiPrefix}/recipe-types/`, recipeType)
            .pipe(
                catchError(DataService.handleError)
            );
    }

    getRecipeTypeRev(name: string): Observable<any> {
        return this.http.get<RecipeType>(`${this.apiPrefix}/recipe-types/${name}/revisions/`)
        .pipe(
            map(response => {
                return ApiResults.transformer(response);
            }),
            catchError(DataService.handleError)
        );
    }

    editRecipeType(name: string, recipeType: any): Observable<any> {
        return this.http.patch<any>(`${this.apiPrefix}/recipe-types/${name}/`, recipeType)
            .pipe(
                catchError(DataService.handleError)
            );
    }
}
