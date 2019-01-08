import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import polling from 'rx-polling';

import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

import { NodeStatus } from '../../../system/nodes/api.status.model';
import { DataService } from '../data.service';

@Injectable()
export class StatusApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('status');
    }

    getStatus(poll?: boolean): Observable<any> {
        if (poll) {
            const request = this.http.get<any>(`${this.apiPrefix}/status/`)
                .pipe(
                    map(response => {
                        response.nodes = NodeStatus.transformer(response.nodes, response.job_types);
                        return response;
                    }),
                    catchError(this.dataService.handleError)
                );
            return polling(request, { interval: 300000 });
        }
        return this.http.get<any>(`${this.apiPrefix}/status/`)
            .pipe(
                map(response => {
                    response.nodes = NodeStatus.transformer(response.nodes, response.job_types);
                    return response;
                }),
                catchError(this.dataService.handleError)
            );
    }
}
