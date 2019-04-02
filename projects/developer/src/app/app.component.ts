import { Component, OnInit } from '@angular/core';

import { environment } from '../environments/environment';
import { ThemeService } from './theme';
import { ProfileService } from './common/services/profile.service';

@Component({
    selector: 'dev-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'Scale';
    loading = false;
    theme: any;
    isAuthenticated: boolean;
    header: string;
    message: string;
    detail: string;

    constructor(
        private themeService: ThemeService,
        private profileService: ProfileService
    ) {}

    ngOnInit() {
        // init theme
        this.theme = localStorage.getItem(environment.themeKey) || environment.defaultTheme;
        this.themeService.setTheme(this.theme);

        if (environment.auth.enabled) {
            this.loading = true;
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
}
