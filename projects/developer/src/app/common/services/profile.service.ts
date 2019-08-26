import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, share } from 'rxjs/internal/operators';

import { environment } from '../../../environments/environment';
import { DataService } from './data.service';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    apiPrefix: string;
    isAuthenticated = new BehaviorSubject(!environment.authEnabled);

    constructor(
        private http: HttpClient
    ) {
        this.apiPrefix = DataService.getApiPrefix('profile');
    }

    getProfile(): Observable<any> {
        const obv = this.http.get(`${this.apiPrefix}/accounts/profile/`)
            .pipe(share())
            .pipe(
                catchError(DataService.handleError)
            );

        obv.subscribe(data => {
            if (data) {
                this.isAuthenticated.next(true);
            } else {
                this.isAuthenticated.next(false);
            }
        }, err => {
            this.isAuthenticated.next(false);
        });

        return obv;
    }

    getLogin(): Observable<any> {
        return this.http.get<any>(`${environment.authSchemeUrl}`)
            .pipe(
                catchError(DataService.handleError)
            );
    }

    login(data): Observable<any> {
        return this.http.post<any>(`${environment.authSchemeUrl}`, data)
            .pipe(
                catchError(DataService.handleError)
            );
    }
}
