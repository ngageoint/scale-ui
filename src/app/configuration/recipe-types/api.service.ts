import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { catchError, map } from 'rxjs/internal/operators';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';
import { RecipeType } from './api.model';

@Injectable()
export class RecipeTypesApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('recipe-types');
    }

    getRecipeTypes(params?: any): Observable<ApiResults> {
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
        return this.http.get<ApiResults>(`${this.apiPrefix}/recipe-types/`, { params: queryParams })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }

    getRecipeType(id: number): Observable<any> {
        return this.http.get<RecipeType>(`${this.apiPrefix}/recipe-types/${id}/`)
            .pipe(
                map(response => {
                    return RecipeType.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }
}
