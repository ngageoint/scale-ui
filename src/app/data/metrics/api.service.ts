import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { DataService } from '../../data.service';
import { ApiResults } from '../../api-results.model';

@Injectable()
export class MetricsApiService {
    apiPrefix: string;

    constructor(
        private http: Http,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('metrics');
    }

    getDataTypes(): Promise<ApiResults> {
        return this.http.get(`${this.apiPrefix}/metrics/`)
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }

    getDataTypeOptions(name: string): Promise<any> {
        return this.http.get(`${this.apiPrefix}/metrics/${name}/`)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    getPlotData(params: any): Promise<ApiResults> {
        return this.http.get(`${this.apiPrefix}/metrics/${params.dataType}/plot-data/`, { params: params })
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
