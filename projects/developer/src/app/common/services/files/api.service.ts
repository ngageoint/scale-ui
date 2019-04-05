import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import polling from 'rx-polling';
import * as _ from 'lodash';

import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

import { DataService } from '../data.service';
import { ApiResults } from '../../models/api-results.model';

@Injectable({
    providedIn: 'root'
})
export class FilesApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient
    ) {
        this.apiPrefix = DataService.getApiPrefix('files');
    }

    getFiles(params: any, poll?: Boolean): Observable<any> {
        const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        let apiParams: any = {
            page: page.toString(),
            page_size: params.rows ? params.rows.toString() : null,
            data_started: params.data_started,
            data_ended: params.data_ended,
            source_started: params.source_started,
            source_ended: params.source_ended,
            source_sensor_class: params.source_sensor_class,
            source_sensor: params.source_sensor,
            source_collection: params.source_collection,
            source_task: params.source_task,
            modified_started: params.modified_started,
            modified_ended: params.modified_ended,
            order: sortStr,
            job_output: params.job_output,
            job_id: params.job_id ? params.job_id.toString() : null,
            job_type_id: params.job_type_id ? params.job_type_id.toString() : null,
            recipe_id: params.recipe_id ? params.recipe_id.toString() : null,
            recipe_node: params.recipe_node,
            recipe_type_id: params.recipe_type_id ? params.recipe_type_id.toString() : null,
            batch_id: params.batch_id ? params.batch_id.toString() : null,
            file_name: params.file_name
        };
        apiParams = _.pickBy(apiParams, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const queryParams = new HttpParams({
            fromObject: apiParams
        });
        if (poll) {
            const request = this.http.get(`${this.apiPrefix}/files/`, { params: queryParams })
                .pipe(
                    map(response => {
                        return ApiResults.transformer(response);
                    }),
                    catchError(DataService.handleError)
                );
            return polling(request, { interval: 600000, attempts: 0 });
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/files/`, { params: queryParams })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }

    getFile(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiPrefix}/files/${id}/`)
            .pipe(
                catchError(DataService.handleError)
            );
    }
}
