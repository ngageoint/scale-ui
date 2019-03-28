import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/internal/operators';

import { DataService } from './data.service';

@Injectable()
export class EnvironmentService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('profile');
    }

    getEnvironment(path: string): Observable<any> {
        return this.http.get<any>(path)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }
}
