import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';

import { environment } from '../../../environments/environment';
import { ThemeService } from '../../theme';

@Injectable({
    providedIn: 'root'
})
export class AppConfigService {
    constructor(
        private http: HttpClient,
        private themeService: ThemeService
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
                environment.documentation = data.documentation;
                environment.siloUrl = data.siloUrl;
                environment.themeKey = data.themeKey;
                environment.primaryColor = data.primaryColor;
                environment.secondaryLightColor = data.secondaryLightColor;
                environment.secondaryDarkColor = data.secondaryDarkColor;

                // update themes with values from config
                const themes = this.themeService.getThemes();
                _.forEach(themes, theme => {
                    if (theme) {
                        this.themeService.updateTheme(theme.name, {
                            '--scale-primary': data.primaryColor,
                            '--scale-secondary-light': data.secondaryLightColor,
                            '--scale-secondary-dark': data.secondaryDarkColor
                        });
                    }
                });
            });
    }
}
