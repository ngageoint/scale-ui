import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { ApiResults } from '../../api-results.model';
import { SourceFile } from './api.model';
import { SourceFilesDatatable } from './datatable.model';

@Injectable()
export class SourceFilesApiService {
    constructor(
        private http: Http
    ) { }
    getSourceFiles(params: SourceFilesDatatable): Promise<ApiResults> {
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
        return this.http.get('/mocks/source-files', { params: queryParams })
            .toPromise()
            .then(response => response.json() as ApiResults)
            .catch(this.handleError);
    }
    getSourceFile(id: number): Promise<SourceFile> {
        return this.http.get('/mocks/source-files/' + id)
            .toPromise()
            .then(response => response.json() as SourceFile)
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
