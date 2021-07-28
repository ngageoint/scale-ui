import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

import { DataService } from './../../common/services/data.service';
import { IDataset } from './dataset';
import { ApiResults } from '../../common/models/api-results.model';
import * as _ from 'lodash';
import { Dataset } from '../models/dataset.model';

@Injectable({
  providedIn: 'root'
})
export class DatasetsApiService {
    apiPrefix: string;

    constructor (
        private http: HttpClient
    ) {
        this.apiPrefix = DataService.getApiPrefix('datasets');
    }

    getDatasets(params): Observable<ApiResults> {
        const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        let apiParams: any = {
            order: sortStr,
            page: page.toString(),
            page_size: params.rows ? params.rows.toString() : null,
            started: params.started,
            ended: params.ended,
            dataset_id: params.dataset_id ? params.dataset_id : null,
            keyword: params.keyword ? params.keyword : null
        };
        apiParams = _.pickBy(apiParams, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const queryParams = new HttpParams({fromObject: apiParams});
        return this.http.get<ApiResults>(`${this.apiPrefix}/datasets/`, { params: queryParams })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }

    getDataset(id: number): Observable<any> {
        this.http.get('')
            .pipe(
                map(response => response),
                catchError(DataService.handleError)
            );
        return of(true);
    }

    createDatasetWithDataTemplate(options: any): Observable<any> {
        let recipeFileInput;
        let recipeJsonInput;

        if (options.recipeFile) {
            recipeFileInput = options.recipeFile.name;
        }
        if (options.recipeJson) {
            recipeJsonInput = options.recipeJson.name;
        }
        const datasetMetaData: IDataset = {
            title: options.title,
            description: options.description,
            definition: {
                global_data: {files: {}, json: {}},
                global_parameters: {files: [], json: []},
                parameters: {files: [{name: recipeFileInput}], json: [{name: recipeJsonInput}]}
            },
            data_template: {
                files: {[recipeFileInput]: 'FILE_VALUE'},
                json: {[recipeJsonInput]: 'JSON_VALUE'}
            }
        };
        if (options.type === 'data') {
        datasetMetaData['data_started'] = new Date(options.startDate).toISOString();
        datasetMetaData['data_ended'] = new Date(options.endDate).toISOString();
        } else if (options.type === 'ingest') {
            datasetMetaData['created_started'] = new Date(options.startDate).toISOString();
            datasetMetaData['created_ended'] = new Date(options.endDate).toISOString();
        }
        if (options.optionalFilters.locationFilter) {
            datasetMetaData['countries'] = options.optionalFilters.locationFilter;
        }
        if (options.optionalFilters.mediaTypesFilter) {
            datasetMetaData['media_type'] = options.optionalFilters.mediaTypesFilter;
        }
        if (options.optionalFilters.fileTypesFilter) {
            datasetMetaData['file_type'] = options.optionalFilters.fileTypesFilter;
        }

        return this.http.post(`${this.apiPrefix}/datasets/`, datasetMetaData).pipe(
            map(response => Dataset.transformer(response)),
            catchError(DataService.handleError)
        );
    }

    addMembers(id: number, memberIds: number[]): Observable<any> {
        const options = {
            data: memberIds.map(memberId => ({'files': {'INPUT_FILE': [memberId]}, 'json': {}}))
        };
        return this.http.post(`${this.apiPrefix}/datasets/${id}`, options).pipe(
            map(response => Dataset.transformer(response)),
            catchError(DataService.handleError)
        );
    }
}

export interface IDatasetAPIParams {
    'page'?: string;
    'page_size'?:	string;
    'started'?: string;
    'ended'?: string;
    'dataset_id'?: string;
    'keyword'?: string;
    'order'?: string;
}
