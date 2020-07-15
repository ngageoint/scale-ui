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
import { Globals } from './globals';

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
    private is_staff: boolean;

    constructor(
        private themeService: ThemeService,
        private profileService: ProfileService,
        private dataService: DataService,
        private titleService: Title,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private globals: Globals
    ) {
        this.is_staff = this.globals.is_staff;
    }

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
                    this.globals.is_staff = this.dataService.profile.is_staff;
                } else {
                    // attempt to authenticate
                    if (environment.authSchemeType === 'form') {
                        // show login form
                        this.header = 'Authentication is Required';
                        this.message = 'Enter your username and password to continue.';
                        this.isAuthenticated = false;
                    } else {
                        // redirect
                        this.header = 'Authentication is Required';
                        this.message = 'Redirecting...';
                        setTimeout(() => {
                            window.location.href = `${environment.authSchemeUrl}?next=${window.location.href}`;
                        }, environment.authRedirectTimeout);
                    }
                }
            }, err => {
                this.loading = false;
                console.log(err);
                if (environment.authSchemeType === 'form') {
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
                    this.message = 'Redirecting...';
                    setTimeout(() => {
                        window.location.href = `${environment.authSchemeUrl}?next=${window.location.href}`;
                    }, environment.authRedirectTimeout);
                }
            });
        } else {
            this.isAuthenticated = true;
            this.globals.is_staff = false;
        }
    }
}
