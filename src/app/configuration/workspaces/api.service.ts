import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';
import { catchError, map } from 'rxjs/internal/operators';

@Injectable()
export class WorkspacesApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('workspaces');
    }

    getWorkspaces(params?: object): Observable<ApiResults> {
        const queryParams = {};
        // if (params) {
        //     const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        //     const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        //     queryParams = {
        //         order: sortStr,
        //         page: page,
        //         page_size: params.rows,
        //         started: params.started,
        //         ended: params.ended,
        //         name: params.name
        //     };
        // }
        return this.http.get<ApiResults>(`${this.apiPrefix}/workspaces/`, { params: queryParams })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }
}
