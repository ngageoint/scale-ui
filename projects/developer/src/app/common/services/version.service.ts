import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/internal/operators';

import { DataService } from '../../common/services/data.service';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
    apiPrefix: string;

    constructor(
        private http: HttpClient
    ) {
        this.apiPrefix = DataService.getApiPrefix('version');
    }

    getVersion() {
        return this.http.get(`${this.apiPrefix}/version/`)
        .pipe(
        catchError(DataService.handleError)
        );
    }
}
