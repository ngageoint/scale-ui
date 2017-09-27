import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { ApiResults } from '../../api-results.model';

@Injectable()
export class MetricsApiService {
    constructor(private http: Http) {
    }

    getDataTypes(): Promise<ApiResults> {
        return this.http.get('/mocks/metrics')
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }

    getDataTypeOptions(name: string): Promise<any> {
        return this.http.get(`/mocks/metrics/${name}`)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    getPlotData(params: any): Promise<ApiResults> {
        return this.http.get(`/mocks/metrics/${params.dataType}/plot-data`, { params: params })
            .toPromise()
            .then(response => ApiResults.transformer(response.json()))
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
