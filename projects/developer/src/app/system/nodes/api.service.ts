import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import polling from 'rx-polling';

import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

import { Node } from './api.model';
import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';

@Injectable({
    providedIn: 'root'
})
export class NodesApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient
    ) {
        this.apiPrefix = DataService.getApiPrefix('nodes');
    }

    getNodes(params?: any, poll?: boolean): Observable<any> {
        params = params || {
            page: 1,
            page_size: 1000
        };
        if (poll) {
            const request = this.http.get(`${this.apiPrefix}/nodes/`, { params: params })
                .pipe(
                    map(response => {
                        const returnObj = ApiResults.transformer(response);
                        returnObj.results = Node.transformer(returnObj.results);
                        return returnObj;
                    }),
                    catchError(DataService.handleError)
                );
            return polling(request, { interval: 600000, attempts: 0 });
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/nodes/`, { params: params })
            .pipe(
                map(response => {
                    const returnObj = ApiResults.transformer(response);
                    returnObj.results = Node.transformer(returnObj.results);
                    return returnObj;
                }),
                catchError(DataService.handleError)
            );
    }

    getNode(id: number): Observable<any> {
        return this.http.get<ApiResults>(`${this.apiPrefix}/nodes/${id}`)
            .pipe(
                catchError(DataService.handleError)
            );
    }

    updateNode(node: any): Observable<any> {
        const updatedNode = {
            is_paused: node.is_paused,
            pause_reason: node.pause_reason,
            is_active: node.is_active
        };
        return this.http.patch<any>(`${this.apiPrefix}/nodes/${node.id}/`, updatedNode)
            .pipe(
                catchError(DataService.handleError)
            );
    }
}
