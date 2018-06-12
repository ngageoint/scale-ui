import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';

@Injectable()
export class MetricsApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('metrics');
    }

    getDataTypes(): Observable<ApiResults> {
        return this.http.get<ApiResults>(`${this.apiPrefix}/metrics/`)
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }

    getDataTypeOptions(name: string): Observable<any> {
        return this.http.get<any>(`${this.apiPrefix}/metrics/${name}/`)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }

    getPlotData(params: any): Observable<ApiResults> {
        return this.http.get<ApiResults>(`${this.apiPrefix}/metrics/${params.dataType}/plot-data/`, { params: params })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }
}
