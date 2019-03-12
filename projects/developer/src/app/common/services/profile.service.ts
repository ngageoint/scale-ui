import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/internal/operators';

import { environment } from '../../../environments/environment';
import { DataService } from './data.service';

@Injectable()
export class ProfileService {
    apiPrefix: string;

    constructor(
        private http: HttpClient,
        private dataService: DataService
    ) {
        this.apiPrefix = this.dataService.getApiPrefix('profile');
    }

    getProfile(): Observable<any> {
        return this.http.get<any>(`${this.apiPrefix}/accounts/profile/`)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }

    getLogin(): Observable<any> {
        return this.http.get<any>(`${environment.auth.scheme.url}`)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }

    login(data): Observable<any> {
        return this.http.post<any>(`${environment.auth.scheme.url}`, data)
            .pipe(
                catchError(this.dataService.handleError)
            );
    }
}
