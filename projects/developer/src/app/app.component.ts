import { Component, OnInit } from '@angular/core';

import { DataService } from './common/services/data.service';
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
        private dataService: DataService,
        private profileService: ProfileService
    ) {}

    ngOnInit() {
        this.profileService.getProfile().subscribe(data => {
            this.loading = false;
            console.log(data);
            // TODO either set isAuthenticated to true, redirect to geoaxis, or show login form based on returned data
            // this.isAuthenticated = true;
            // this.dataService.setIsAuthenticated(this.isAuthenticated);
        }, err => {
            this.loading = false;
            console.log(err);
            if (environment.enableGeoaxis) {
                this.header = 'Unable to Retrieve Authentication Status';
                this.message = 'Redirecting to GEOAxIS...';
                window.location.href = `${environment.geoaxisUrl}http://127.0.0.1:8080`;
            } else {
                this.header = 'Unable to Retrieve Authentication Status';
                this.message = 'The authentication system is unavailable.';
                this.detail = err.statusText;
                this.isAuthenticated = false;
                this.dataService.setIsAuthenticated(this.isAuthenticated);
            }
        });
    }
}
