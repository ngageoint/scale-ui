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

    loadAppConfig(path: string): Promise<any> {
        return this.http.get(path)
            .toPromise()
            .then((data: any) => {
                // loop over all keys in the appconfig.json file
                Object.keys(data).forEach(key => {
                    // try to parse the values as json
                    let value = data[key];
                    try {
                        value = JSON.parse(value);
                    } catch (e) {
                        // ignore, not valid json value so default to original
                    }

                    // set the camelcased version of the key in environments
                    environment[_.camelCase(key)] = value;
                });
                // update themes with values from config
                const themes = this.themeService.getThemes();
                _.forEach(themes, theme => {
                    if (theme) {
                        this.themeService.updateTheme(theme.name, {
                            '--scale-primary': environment.primaryColor,
                            '--scale-secondary-light': environment.secondaryLightColor,
                            '--scale-secondary-dark': environment.secondaryDarkColor
                        });
                    }
                });
            });
    }
}
