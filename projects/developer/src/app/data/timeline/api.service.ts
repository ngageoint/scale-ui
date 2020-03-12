import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';

@Injectable({
    providedIn: 'root'
})
export class TimelineApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient
    ) {
        this.apiPrefix = DataService.getApiPrefix('timeline');
    }

    getRecipeTypeDetails(params: any): Observable<ApiResults> {
        return this.http.get<ApiResults>(`${this.apiPrefix}/timeline/recipe-types/`, { params: params })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }

    getJobTypeDetails(params: any): Observable<ApiResults> {
        return this.http.get<ApiResults>(`${this.apiPrefix}/timeline/recipe-types/`, { params: params })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }
}
