import { Component, OnInit } from '@angular/core';

import { EnvironmentService } from './common/services/environment.service';
import { ProfileService } from './common/services/profile.service';
import { environment } from '../environments/environment';

@Component({
    selector: 'dev-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'Scale';
    loading = true;
    environmentLoaded = !environment.runtime;
    environmentPath = '/assets/environment.json';
    isAuthenticated: boolean;
    header: string;
    message: string;
    detail: string;

    constructor(
        private environmentService: EnvironmentService,
        private profileService: ProfileService
    ) {}

    bootstrapApplication() {
        if (environment.auth.enabled) {
            this.profileService.getProfile().subscribe(data => {
                this.loading = false;
                console.log(data);
                if (data) {
                    // continue to app
                    this.isAuthenticated = true;
                } else {
                    // attempt to authenticate
                    if (environment.auth.scheme.type === 'geoaxis') {
                        // redirect to geoaxis login
                        this.header = 'Authentication is Required';
                        this.message = 'Redirecting to GEOAxIS...';
                        window.location.href = `${environment.auth.scheme.url}http://127.0.0.1:8080`;
                    } else {
                        // show login form
                        this.header = 'Authentication is Required';
                        this.message = 'Enter your username and password to continue.';
                        this.isAuthenticated = false;
                    }
                }
            }, err => {
                this.loading = false;
                console.log(err);
                if (environment.auth.scheme.type === 'geoaxis') {
                    this.header = 'Authentication is Required';
                    this.message = 'Redirecting to GEOAxIS...';
                    window.location.href = `${environment.auth.scheme.url}${window.location.href}`;
                } else if (environment.auth.scheme.type === 'form') {
                    // GET call to retrieve CSRF cookie
                    this.profileService.getLogin().subscribe(data => {
                        console.log(data);
                        this.header = 'Authentication is Required';
                        this.message = 'Please use the form to login.';
                        this.detail = err.statusText;
                        this.isAuthenticated = false;
                    }, loginErr => {
                        console.log('error', loginErr);
                        this.header = 'Authentication is Required';
                        this.message = 'Please use the form to login.';
                        this.detail = err.statusText;
                        this.isAuthenticated = false;
                    });
                } else {
                    // redirect
                    this.header = 'Authentication is Required';
                    this.message = 'Redirecting to login form...';
                    setTimeout(() => {
                        window.location.href = `${environment.auth.scheme.url}?next=${window.location.href}`;
                    }, 3000);
                }
            });
        } else {
            this.isAuthenticated = true;
        }
    }

    loadEnvironment() {
        this.environmentService.getEnvironment(this.environmentPath).subscribe(data => {
            // set up environment
            environment.apiDefaultVersion = data.apiDefaultVersion;
            environment.apiPrefix = data.apiPrefix;
            environment.apiVersions = data.apiVersions;
            environment.auth = data.auth;
            environment.dateFormat = data.dateFormat;
            environment.defaultTheme = data.defaultTheme;
            environment.scale = data.scale;
            environment.siloUrl = data.siloUrl;
            this.environmentLoaded = true;

            // continue loading app
            this.bootstrapApplication();
        });
    }

    ngOnInit() {
        if (environment.runtime) {
            this.loadEnvironment();
        } else {
            this.bootstrapApplication();
        }
    }
}
