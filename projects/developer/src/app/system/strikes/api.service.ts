import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import polling from 'rx-polling';

import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';
import { Strike } from './api.model';

@Injectable({
    providedIn: 'root'
})
export class StrikesApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('strikes');
    }

    getStrikes(params?: any, poll?: boolean): Observable<any> {
        params = params || {
            page: 1,
            page_size: 1000
        };
        if (poll) {
            const request = this.http.get(`${this.apiPrefix}/strikes/`, { params: params })
                .pipe(
                    map(response => {
                        const returnObj = ApiResults.transformer(response);
                        returnObj.results = Strike.transformer(returnObj.results);
                        return returnObj;
                    }),
                    catchError(this.dataService.handleError)
                );
            return polling(request, { interval: 600000 });
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/strikes/`, { params: params })
            .pipe(
                map(response => {
                    const returnObj = ApiResults.transformer(response);
                    returnObj.results = Strike.transformer(returnObj.results);
                    return returnObj;
                }),
                catchError(this.dataService.handleError)
            );
    }

    getStrike(id: number): Observable<any> {
        return this.http.get<ApiResults>(`${this.apiPrefix}/strikes/${id}/`)
            .pipe(
                map(response => {
                    return Strike.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }
}
