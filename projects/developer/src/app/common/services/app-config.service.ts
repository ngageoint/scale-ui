import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AppConfigService {
    constructor(
        private http: HttpClient
    ) {}

    loadAppConfig(path: string) {
        return this.http.get(path)
            .toPromise()
            .then((data: any) => {
                environment.apiDefaultVersion = data.apiDefaultVersion;
                environment.apiPrefix = data.apiPrefix;
                environment.apiVersions = data.apiVersions;
                environment.auth = data.auth;
                environment.dateFormat = data.dateFormat;
                environment.defaultTheme = data.defaultTheme;
                environment.siloUrl = data.siloUrl;
                environment.themeKey = data.themeKey;
            });
    }
}
