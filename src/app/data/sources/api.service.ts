import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { DataService } from '../../data.service';
import { ApiResults } from '../../api-results.model';
import { Source } from './api.model';
import { SourcesDatatable } from './datatable.model';

@Injectable()
export class SourcesApiService {
    apiPrefix: string;

    constructor(
        private http: Http,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('sources');
    }
    getSources(params: SourcesDatatable): Promise<ApiResults> {
        const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        const queryParams = {
            order: sortStr,
            page: page,
            page_size: params.rows,
            started: params.started,
            ended: params.ended,
            time_field: params.time_field,
            is_parsed: params.is_parsed,
            file_name: params.file_name
        };
        return this.http.get(`${this.apiPrefix}/sources/`, { params: queryParams })
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }
    getSource(id: number): Promise<Source> {
        return this.http.get(`${this.apiPrefix}/sources/${id}/`)
            .toPromise()
            .then(response => Source.transformer(response.json()))
            .catch(this.handleError);
    }
    getSourceDescendants(id: number, type: string, params: any): Promise<ApiResults> {
        const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        const queryParams = {
            order: sortStr,
            page: page,
            page_size: params.rows,
            started: params.started,
            ended: params.ended,
            status: params.status,
            job_id: params.job_id,
            job_type_id: params.job_type_id,
            job_type_name: params.job_type_name,
            job_type_category: params.job_type_category,
            error_category: params.error_category,
            include_superseded: params.include_superseded
        };
        return this.http.get(`${this.apiPrefix}/sources/${id}/${type}/`, { params: queryParams })
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
