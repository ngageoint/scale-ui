import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import polling from 'rx-polling';
import * as _ from 'lodash';

import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';
import { JobType } from './api.model';
import { JobTypeName } from './api.name.model';
import { RunningJobsDatatable } from '../../processing/running-jobs/datatable.model';

@Injectable()
export class JobTypesApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = DataService.getApiPrefix('job-types');
    }

    getJobTypes(params?: any): Observable<ApiResults> {
        let apiParams = {};
        if (params) {
            const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
            const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
            apiParams = {
                page: page,
                page_size: params.rows || 1000,
                keyword: params.keyword,
                id: params.id,
                is_active: params.is_active || true,
                is_system: params.is_system,
                order: sortStr
            };
        } else {
            apiParams = {
                page_size: 1000,
                is_active: true
            };
        }
        apiParams = _.pickBy(apiParams, d => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const queryParams = new HttpParams({
            fromObject: apiParams
        });
        return this.http.get<ApiResults>(`${this.apiPrefix}/job-types/`, { params: queryParams })
            .pipe(
                map(response => {
                    const returnObj = ApiResults.transformer(response);
                    returnObj.results = JobType.transformer(returnObj.results);
                    return returnObj;
                }),
                catchError(DataService.handleError)
            );
    }

    getJobTypeNames(params?: any): Observable<ApiResults> {
        let queryParams = {};
        if (params) {
            const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
            const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
            queryParams = {
                page: page,
                page_size: params.rows || 1000,
                keyword: params.keyword,
                id: params.id,
                is_active: params.is_active,
                is_system: params.is_system,
                order: sortStr
            };
        } else {
            queryParams = {
                page_size: 1000
            };
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/job-type-names/`, { params: queryParams })
            .pipe(
                map(response => {
                    const returnObj = ApiResults.transformer(response);
                    returnObj.results = JobTypeName.transformer(returnObj.results);
                    return returnObj;
                }),
                catchError(DataService.handleError)
            );
    }

    getJobTypeVersions(name: string, params?: any): Observable<ApiResults> {
        let queryParams = {};
        if (params) {
            const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
            queryParams = {
                page: page,
                page_size: params.rows || 1000,
                is_active: params.is_active
            };
        } else {
            queryParams = {
                page_size: 1000
            };
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/job-types/${name}/`, { params: queryParams })
            .pipe(
                map(response => {
                    const returnObj = ApiResults.transformer(response);
                    returnObj.results = JobType.transformer(returnObj.results);
                    return returnObj;
                }),
                catchError(DataService.handleError)
            );
    }

    getJobType(name: string, version: string): Observable<any> {
        return this.http.get<JobType>(`${this.apiPrefix}/job-types/${name}/${version}/`)
            .pipe(
                map(response => {
                    return JobType.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }

    validateJobType(jobType: JobType): Observable<any> {
        return this.http.post<any>(`${this.apiPrefix}/job-types/validation/`, jobType)
            .pipe(
                catchError(DataService.handleError)
            );
    }

    createJobType(jobType: JobType): Observable<any> {
        return this.http.post<any>(`${this.apiPrefix}/job-types/`, jobType)
            .pipe(
                catchError(DataService.handleError)
            );
    }

    updateJobType(jobType: JobType): Observable<any> {
        const updatedJobType = {
            is_paused: jobType.is_paused
        };
        return this.http.patch<any>(`${this.apiPrefix}/job-types/${jobType.id}/`, updatedJobType)
            .pipe(
                catchError(DataService.handleError)
            );
    }

    getJobTypeStatus(poll?: Boolean): Observable<any> {
        if (poll) {
            const request = this.http.get(`${this.apiPrefix}/job-types/status/`)
                .pipe(
                    map(response => {
                        return ApiResults.transformer(response);
                    }),
                    catchError(DataService.handleError)
                );
            return polling(request, { interval: 600000, attempts: 0 });
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/job-types/status/`)
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }

    getRunningJobs(params: RunningJobsDatatable, poll?: Boolean): Observable<any> {
        const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
        const queryParams = new HttpParams({
            fromObject: {
                page: page.toString(),
                page_size: params.rows ? params.rows.toString() : null,
            }
        });

        if (poll) {
            const request = this.http.get(`${this.apiPrefix}/job-types/running/`, { params: queryParams })
                .pipe(
                    map(response => {
                        return ApiResults.transformer(response);
                    }),
                    catchError(DataService.handleError)
                );
            return polling(request, { interval: 5000, attempts: 0 });
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/job-types/running/`, { params: queryParams })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(DataService.handleError)
            );
    }

    scanJobTypeWorkspace(params: any): Observable<any> {
        return this.http.patch<any>(`${this.apiPrefix}/job-types/${params.id}/`, { params: params.trigger_rule })
            .pipe(
                catchError(DataService.handleError)
            );
    }
}
