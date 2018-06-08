import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/toPromise';

import { DataService } from '../../common/services/data.service';
import { ApiResults } from '../../common/models/api-results.model';

@Injectable()
export class MetricsApiService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('metrics');
    }

    getDataTypes(): Promise<ApiResults> {
        return this.http.get(`${this.apiPrefix}/metrics/`)
            .toPromise()
            .then(response => Promise.resolve(ApiResults.transformer(response)))
            .catch(this.handleError);
    }

    getDataTypeOptions(name: string): Promise<any> {
        return this.http.get(`${this.apiPrefix}/metrics/${name}/`)
            .toPromise()
            .then(response => Promise.resolve(response))
            .catch(this.handleError);
    }

    getPlotData(params: any): Promise<ApiResults> {
        return this.http.get(`${this.apiPrefix}/metrics/${params.dataType}/plot-data/`, { params: params })
            .toPromise()
            .then(response => Promise.resolve(ApiResults.transformer(response)))
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
