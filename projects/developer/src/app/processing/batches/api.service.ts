import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import polling from 'rx-polling';
import * as _ from 'lodash';

import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';
import { Batch } from './api.model';
import { BatchesDatatable } from './datatable.model';

@Injectable({
    providedIn: 'root'
})
export class BatchesApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient
    ) {
        this.apiPrefix = DataService.getApiPrefix('batches');
    }

    getBatches(params: BatchesDatatable, poll?: Boolean): Observable<any> {
        const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        let apiParams: any = {
            order: sortStr,
            page: page.toString(),
            page_size: params.rows ? params.rows.toString() : null,
            started: params.started,
            ended: params.ended,
            recipe_type_id: params.recipe_type_id,
            is_creation_done: params.is_creation_done,
            is_superseded: params.is_superseded,
            root_batch_id: params.root_batch_id
        };
        apiParams = _.pickBy(apiParams, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const queryParams = new HttpParams({
            fromObject: apiParams
        });
        if (poll) {
            const request = this.http.get(`${this.apiPrefix}/batches/`, { params: queryParams })
                .pipe(
                    map(response => {
                        return ApiResults.transformer(response);
                    }),
                    catchError(DataService.handleError)
                );
            return polling(request, { interval: 600000, attempts: 0 });
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/batches/`, { params: queryParams })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }

    getBatch(id): Observable<any> {
        return this.http.get<Batch>(`${this.apiPrefix}/batches/${id}/`)
            .pipe(
                map(response => {
                    return Batch.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }

    validateBatch(batch: Batch): Observable<any> {
        return this.http.post<any>(`${this.apiPrefix}/batches/validation/`, batch.cleanBatch())
            .pipe(
                catchError(DataService.handleError)
            );
    }

    createBatch(batch: Batch): Observable<any> {
        return this.http.post<Batch>(`${this.apiPrefix}/batches/`, batch.newBatch())
            .pipe(
                map(response => {
                    return Batch.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }

    editBatch(batch: Batch): Observable<any> {
        return this.http.patch<Batch>(`${this.apiPrefix}/batches/${batch.id}/`, batch.editBatch())
            .pipe(
                catchError(DataService.handleError)
            );
    }
}
