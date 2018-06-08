import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { catchError, map } from 'rxjs/internal/operators';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';
import { JobType } from './api.model';
import { RunningJobsDatatable } from '../../processing/running-jobs/datatable.model';

@Injectable()
export class JobTypesApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('job-types');
    }

    getJobTypes(params?: any): Observable<ApiResults> {
        let queryParams = {};
        if (params) {
            const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
            const page = params.first && params.rows ? (params.first / params.rows) + 1 : 1;
            queryParams = {
                order: sortStr,
                page: page,
                page_size: params.rows || 1000,
                started: params.started,
                ended: params.ended,
                name: params.name,
                category: params.category,
                is_active: params.is_active,
                is_operational: params.is_operational
            };
        } else {
            queryParams = {
                page_size: 1000
            };
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/job-types/`, { params: queryParams })
            .pipe(
                map(response => {
                    const returnObj = ApiResults.transformer(response);
                    returnObj.results = JobType.transformer(returnObj.results);
                    return returnObj;
                }),
                catchError(this.dataService.handleError)
            );
    }

    getJobType(id: number): Observable<any> {
        return this.http.get<JobType>(`${this.apiPrefix}/job-types/${id}/`)
            .pipe(
                map(response => {
                    return JobType.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }

    validateJobType(jobType: JobType): Observable<any> {
        return this.http.post<any>(`${this.apiPrefix}/job-types/validation/`, jobType)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }

    createJobType(jobType: JobType): Observable<any> {
        return this.http.post<any>(`${this.apiPrefix}/job-types/`, jobType)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }

    updateJobType(jobType: JobType): Observable<any> {
        const updatedJobType = {
            is_paused: jobType.is_paused
        };
        return this.http.patch<any>(`${this.apiPrefix}/job-types/${jobType.id}/`, updatedJobType)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }

    getJobTypeStatus(poll?: Boolean): Observable<any> {
        if (poll) {
            const request = this.http.get(`${this.apiPrefix}/job-types/status/`);
            const mapRequest = response => {
                return ApiResults.transformer(response);
            };
            return this.dataService.generatePoll(600000, request, mapRequest);
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/job-types/status/`)
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(this.dataService.handleError)
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
            const request = this.http.get(`${this.apiPrefix}/job-types/running/`, { params: queryParams });
            const mapRequest = response => {
                return ApiResults.transformer(response);
            };
            return this.dataService.generatePoll(5000, request, mapRequest);
        }
        return this.http.get<ApiResults>(`${this.apiPrefix}/job-types/running/`, { params: queryParams })
            .pipe(
                map(response => {
                    return ApiResults.transformer(response);
                }),
                catchError(this.dataService.handleError)
            );
    }

    scanJobTypeWorkspace(params: any): Observable<any> {
        return this.http.patch<any>(`${this.apiPrefix}/job-types/${params.id}/`, { params: params.trigger_rule })
            .pipe(
                catchError(this.dataService.handleError)
            );
    }
}
