import { Component, OnInit } from '@angular/core';

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
    isAuthenticated: boolean;
    header: string;
    message: string;
    detail: string;

    constructor(
        private profileService: ProfileService
    ) {}

    ngOnInit() {
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
                    this.header = 'Unable to Retrieve Authentication Status';
                    this.message = 'Redirecting to GEOAxIS...';
                    window.location.href = `${environment.auth.scheme.url}http://127.0.0.1:8080`;
                } else {
                    this.header = 'Unable to Retrieve Authentication Status';
                    this.message = 'The authentication system is unavailable.';
                    this.detail = err.statusText;
                }
            });
        } else {
            this.isAuthenticated = true;
        }
    }
}
