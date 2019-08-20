import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { environment } from '../environments/environment';
import { ThemeService } from './theme';
import { ProfileService } from './common/services/profile.service';
import { DataService } from './common/services/data.service';

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
        private profileService: ProfileService,
        private dataService: DataService,
        private titleService: Title,
        private activatedRoute: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit() {
        this.router.events
            .filter((event) => event instanceof NavigationEnd)
            .map(() => this.activatedRoute)
            .map((route) => {
                while (route.firstChild) {
                    route = route.firstChild;
                }
                return route;
            })
            .filter((route) => route.outlet === 'primary')
            .mergeMap((route) => route.data)
            .subscribe((event) => this.titleService.setTitle(event['title']));

        // init theme
        this.theme = localStorage.getItem(environment.themeKey) || environment.defaultTheme;
        this.themeService.setTheme(this.theme);

        if (environment.authEnabled) {
            this.loading = true;
            this.profileService.getProfile().subscribe(data => {
                this.loading = false;
                if (data) {
                    // set user data and continue to app
                    this.dataService.setUserProfile(data);
                    this.isAuthenticated = true;
                } else {
                    // attempt to authenticate
                    if (environment.authSchemeType === 'geoaxis') {
                        // redirect to geoaxis login
                        this.header = 'Authentication is Required';
                        this.message = 'Redirecting to GEOAxIS...';
                        window.location.href = `${environment.authSchemeUrl}http://127.0.0.1:8080`;
                    } else if (environment.authSchemeType === 'form') {
                        // show login form
                        this.header = 'Authentication is Required';
                        this.message = 'Enter your username and password to continue.';
                        this.isAuthenticated = false;
                    } else {
                        // redirect
                        this.header = 'Authentication is Required';
                        this.message = 'Redirecting to login form...';
                        setTimeout(() => {
                            window.location.href = `${environment.authSchemeUrl}?next=${window.location.href}`;
                        }, 3000);
                    }
                }
            }, err => {
                this.loading = false;
                console.log(err);
                if (environment.authSchemeType === 'geoaxis') {
                    this.header = 'Authentication is Required';
                    this.message = 'Redirecting to GEOAxIS...';
                    window.location.href = `${environment.authSchemeUrl}${window.location.href}`;
                } else if (environment.authSchemeType === 'form') {
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
                        window.location.href = `${environment.authSchemeUrl}?next=${window.location.href}`;
                    }, 3000);
                }
            });
        } else {
            this.isAuthenticated = true;
        }
    }
}
