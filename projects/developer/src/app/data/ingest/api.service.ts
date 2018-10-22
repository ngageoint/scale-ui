import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';

@Injectable()
export class IngestApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('ingests');
    }

    getIngests(params: any, poll?: boolean): Observable<any> {
        if (poll) {
            const request = this.http.get(`${this.apiPrefix}/ingests/`, { params: params });
            const mapRequest = response => {
                return ApiResults.transformer(response);
            };
            return this.dataService.generatePoll(600000, request, mapRequest);
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/ingests/`, { params: params })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }

    getIngest(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiPrefix}/ingests/${id}/`)
            .pipe(
                map(response => {
                    return response;
                }),
                catchError(this.dataService.handleError)
            );
    }

    getIngestStatus(params: any, poll?: boolean): Observable<any> {
        if (poll) {
            const request = this.http.get(`${this.apiPrefix}/ingests/status/`, { params: params });
            const mapRequest = response => {
                return ApiResults.transformer(response);
            };
            return this.dataService.generatePoll(600000, request, mapRequest);
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/ingests/status/`, { params: params })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }
}
