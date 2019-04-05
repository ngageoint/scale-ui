import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';

import { Observable } from 'rxjs';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';
import { catchError, map } from 'rxjs/internal/operators';
import { Workspace } from './api.model';

@Injectable({
    providedIn: 'root'
})
export class WorkspacesApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient
    ) {
        this.apiPrefix = DataService.getApiPrefix('workspaces');
    }

    getWorkspaces(params?: any): Observable<ApiResults> {
        let queryParams: any = {
            page: 1,
            page_size: 1000
        };
        if (params) {
            const sortStr = params.sortOrder < 0 ? `-${params.sortField}` : params.sortField;
            const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
            queryParams = {
                order: sortStr || null,
                page: page || 1,
                page_size: params.rows || 1000,
                started: params.started || null,
                ended: params.ended || null,
                name: params.name || null
            };
        }
        queryParams = new HttpParams({
            fromObject: _.pickBy(queryParams, d => {
                return d !== null && typeof d !== 'undefined' && d !== '';
            })
        });
        return this.http.get<ApiResults>(`${this.apiPrefix}/workspaces/`, { params: queryParams })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }

    getWorkspace(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiPrefix}/workspaces/${id}/`)
            .pipe(
                map(response => {
                    return Workspace.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }

    validateWorkspace(workspace: any): Observable<any> {
        return this.http.post<any>(`${this.apiPrefix}/workspaces/validation/`, workspace)
            .pipe(
                catchError(DataService.handleError)
            );
    }

    editWorkspace(id: number, workspace: any): Observable<any> {
        return this.http.patch<any>(`${this.apiPrefix}/workspaces/${id}/`, workspace)
            .pipe(
                catchError(DataService.handleError)
            );
    }

    createWorkspace(workspace: any): Observable<any> {
        return this.http.post<any>(`${this.apiPrefix}/workspaces/`, workspace)
            .pipe(
                catchError(DataService.handleError)
            );
    }
}
