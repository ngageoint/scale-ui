import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';
import * as _ from 'lodash';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';


export enum PHASE_STATUS {
    NotStarted,
    InProgress,
    Complete,
    Failed
}


@Injectable({
    providedIn: 'root'
})
export class ProcessingStatusApiService {
    private apiPrefix: string;

    constructor(
        private http: HttpClient
    ) {
        this.apiPrefix = DataService.getApiPrefix('recipes');
    }

    /**
     * Get recipe objects.
     * @param  filters any additional filters to merge into defaults
     * @return         observable with a page of recipes
     */
    public getRecipes(filters: any = {}): Observable<ApiResults> {
        const params = _.merge({
            order: '-last_modified',
            page: 1,
            page_size: 15,
            // recipe_type_id
        }, filters);

        const queryParams = new HttpParams({
            fromObject: params
        });

        return this.http.get<ApiResults>(`${this.apiPrefix}/recipes/`, { params: queryParams })
            .pipe(
                map(response => ApiResults.transformer(response)),
                catchError(DataService.handleError)
            );
    }

    /**
     * Get jobs for a single recipe.
     * @param  recipe_id the recipe to filter on
     * @param  filters   any additional filters to merge into defaults
     * @return           observable with a page of jobs
     */
    public getJobsForRecipe(recipe_id: number, filters: any = {}): Observable<ApiResults> {
        const params = _.merge({
            order: '-last_modified',
            page: 1,
            page_size: 1000,
            recipe_id
        }, filters);

        const queryParams = new HttpParams({
            fromObject: params
        });

        return this.http.get<ApiResults>(`${this.apiPrefix}/jobs/`, { params: queryParams })
            .pipe(
                map(response => ApiResults.transformer(response)),
                catchError(DataService.handleError)
            );
    }

    /**
     * Get products/files for a recipe.
     * @param  recipe_id the recipe to filter on
     * @param  filters   any additional filters to merge into defaults
     * @return           observable with a page of files
     */
    public getProductsForRecipe(recipe_id: number, filters: any = {}): Observable<ApiResults> {
        const params = _.merge({
            order: '-created',
            page: 1,
            page_size: 50,
            recipe_id,
        }, filters);

        const queryParams = new HttpParams({
            fromObject: params
        });

        return this.http.get<ApiResults>(`${this.apiPrefix}/files/`, { params: queryParams })
            .pipe(
                map(response => ApiResults.transformer(response)),
                catchError(DataService.handleError)
            );
    }

}
