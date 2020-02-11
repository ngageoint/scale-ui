import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import polling from 'rx-polling';
import * as _ from 'lodash';

import { Observable, BehaviorSubject } from 'rxjs';
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
    private _validation = new BehaviorSubject<IBatchValidationResponse>(null);
    private _batch = new BehaviorSubject<IBatch>(null);
    private dataStore: { validation: IBatchValidationResponse, batch: IBatch } = {
        validation: null,
        batch: null
    };

    get validation() {
        return this._validation.asObservable();
    }

    get batch() {
        return this._batch.asObservable();
    }

    constructor(private http: HttpClient) {
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

    validateBatch(batch: IBatch) {
        this.http.post<any>(`${this.apiPrefix}/batches/validation/`, batch).subscribe(
           data => {
                this.dataStore.validation = data;
                this._validation.next(Object.assign({}, this.dataStore).validation);
            },
            DataService.handleError
        );
    }

    createBatch(batch: IBatch) {
        this.http.post<IBatch>(`${this.apiPrefix}/batches/`, batch).subscribe(
            data => {
                this.dataStore.batch = data;
                Batch.transformer(data);
                this._batch.next(Object.assign({}, this.dataStore).batch);
            },
            DataService.handleError
        );
    }
}

export interface IBatch {
    title: string;
    description: string;
    recipe_type_id: number;
    supersedes: boolean;
    definition: {
        forced_nodes: {
            all: boolean,
            nodes: string[]
        }
        dataset: number
    };
    configuration: {
        priority: number
    };
}

export interface IBatchValidationResponse {
    recipe_type: {
        id: number,
        name: string,
        title: string,
        description: string,
        revision_num: number
    };
    is_valid: boolean;
    recipes_estimated: number;
    errors: {name: string, description: string}[];
    warnings: {name: string, description: string}[];
}
