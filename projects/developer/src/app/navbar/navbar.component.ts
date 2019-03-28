import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { OverlayPanel } from 'primeng/primeng';
import { MessageService } from 'primeng/primeng';
import * as _ from 'lodash';

import { environment } from '../../environments/environment';
import { ProfileService } from '../common/services/profile.service';
import { ThemeService } from '../theme';

@Component({
    selector: 'dev-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit, OnChanges {
    @Input() theme: string;
    @Input() isAuthenticated: boolean;
    @ViewChild('profileOp') profileOp: OverlayPanel;
    @ViewChild('profile') profile: any;
    @ViewChild('user') usernameEl: any;
    auth = environment.auth;
    selectedId = null;
    subscription: any;
    themeTooltip: string;
    themeIcon: string;
    username: string;
    password: string;
    scheduler: any;
    schedulerClass: string;
    schedulerIcon: string;

    constructor(
        private messageService: MessageService,
        private profileService: ProfileService,
        private themeService: ThemeService
    ) {}

    selectNavItem(event, itemId) {
        event.stopPropagation();
        if (this.selectedId === itemId) {
            // close it
            this.selectedId = null;
        } else {
            this.selectedId = itemId;
        }
    }

    getNavItemStyles(itemId) {
        if (this.selectedId === itemId) {
            return 'navbar__item-selected';
        }
        return 'navbar__item';
    }

    onNavigate() {
        // close the subnav
        this.selectedId = null;
    }

    changeTheme() {
        const active = this.themeService.getActiveTheme();
        const themeLink: HTMLLinkElement = <HTMLLinkElement> document.getElementById('theme-css');
        if (active.name === 'light') {
            themeLink.href = 'assets/themes/dark.css';
            this.themeTooltip = 'Switch to Light Theme';
            this.themeIcon = 'fa fa-sun-o';
            this.themeService.setTheme('dark');
            localStorage.setItem(environment.themeKey, 'dark');
        } else {
            themeLink.href = 'assets/themes/light.css';
            this.themeTooltip = 'Switch to Dark Theme';
            this.themeIcon = 'fa fa-moon-o';
            this.themeService.setTheme('light');
            localStorage.setItem(environment.themeKey, 'light');
        }
    }

    login() {
        this.profileService.login({ username: this.username, password: this.password }).subscribe(data => {
            console.log(data);
        }, err => {
            console.log(err);
            this.messageService.add({ severity: 'error', summary: 'Authentication Error', detail: err.statusText, life: 10000 });
        });
    }

    handleKeyPress(event) {
        if (event.code === 'Enter' && this.username && this.password) {
            this.login();
        }
    }

    handleOnProfileShow() {
        if (!this.isAuthenticated) {
            setTimeout(() => {
                this.usernameEl.nativeElement.focus();
            }, 50);
        }
    }

    onStatusChange(data) {
        this.scheduler = data.scheduler;
        this.scheduler.warnings = _.orderBy(this.scheduler.warnings, ['last_updated'], ['desc']);
        if (this.scheduler.state.name === 'READY') {
            this.schedulerClass = 'label label-success';
            this.schedulerIcon = 'fa fa-check-circle';
        } else if (this.scheduler.state.name === 'PAUSED') {
            this.schedulerClass = 'label label-paused';
            this.schedulerIcon = 'fa fa-pause';
        } else {
            this.schedulerClass = 'label label-default';
            this.schedulerIcon = 'fa fa-circle';
        }
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.theme && changes.theme.currentValue) {
            this.themeTooltip = changes.theme.currentValue === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme';
            this.themeIcon = changes.theme.currentValue === 'light' ? 'fa fa-moon-o' : 'fa fa-sun-o';
            const themeLink: HTMLLinkElement = <HTMLLinkElement> document.getElementById('theme-css');
            if (themeLink) {
                themeLink.href = `assets/themes/${changes.theme.currentValue}.css`;
            }
        }
        if (changes.isAuthenticated && changes.isAuthenticated.currentValue === false) {
            const event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            this.profileOp.show(event, this.profile.nativeElement);
        }
    }
}
