import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Observable } from 'rxjs/Observable';
import { environment } from '../../../environments/environment';

@Injectable()
export class StatusApiService {
    constructor(private http: Http) {
    }

    getStatus(poll?: boolean): any {
        if (poll) {
            const getData = () => {
                return this.http.get(`${environment.apiPrefix}/status/`)
                    .switchMap((data) => Observable.timer(300000) // 5 minutes
                        .switchMap(() => getData())
                        .startWith(data.json()));
            };
            return getData();
        }
        return this.http.get(`${environment.apiPrefix}/status/`)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
