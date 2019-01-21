import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';
import { catchError, map } from 'rxjs/internal/operators';
import { Workspace } from './api.model';

@Injectable()
export class WorkspacesApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('workspaces');
    }

    getWorkspaces(params?: any): Observable<ApiResults> {
        let queryParams = {};
        if (params) {
            const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
            const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
            queryParams = {
                order: sortStr,
                page: page,
                page_size: params.rows,
                started: params.started,
                ended: params.ended,
                name: params.name
            };
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/workspaces/`, { params: queryParams })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }

    getWorkspace(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiPrefix}/workspaces/${id}/`)
            .pipe(
                map(response => {
                    return Workspace.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }

    validateWorkspace(workspace: any): Observable<any> {
        return this.http.post<any>(`${this.apiPrefix}/workspaces/validation/`, workspace)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }

    editWorkspace(id: number, workspace: any): Observable<any> {
        return this.http.patch<any>(`${this.apiPrefix}/workspaces/${id}/`, workspace)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }

    createWorkspace(workspace: any): Observable<any> {
        return this.http.post<any>(`${this.apiPrefix}/workspaces/`, workspace)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }
}
