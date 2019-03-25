import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { OverlayPanel } from 'primeng/primeng';
import { MessageService } from 'primeng/primeng';

import { environment } from '../../environments/environment';
import { ProfileService } from '../common/services/profile.service';

@Component({
    selector: 'dev-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit, OnChanges {
    private THEME_KEY = 'scale.theme';
    @Input() isAuthenticated: boolean;
    @ViewChild('profileOp') profileOp: OverlayPanel;
    @ViewChild('profile') profile: any;
    @ViewChild('user') usernameEl: any;
    auth = environment.auth;
    selectedId = null;
    subscription: any;
    isLight: boolean;
    themeTooltip: string;
    themeIcon: string;
    username: string;
    password: string;
    scheduler: any;
    schedulerClass: string;
    schedulerIcon: string;

    constructor(
        private messageService: MessageService,
        private profileService: ProfileService
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
        const themeLink: HTMLLinkElement = <HTMLLinkElement> document.getElementById('theme-css');
        this.isLight = !this.isLight;
        this.themeTooltip = this.isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme';
        this.themeIcon = this.isLight ? 'fa fa-moon-o' : 'fa fa-sun-o';
        const theme = this.isLight ? 'light' : 'dark';
        themeLink.href = `assets/themes/${theme}.css`;
        localStorage.setItem(this.THEME_KEY, theme);
    }

    login() {
        this.profileService.login({ username: this.username, password: this.password }).subscribe(data => {
            console.log(data);
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Authentication Error', detail: err.statusText, life: 10000});
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
        console.log(data);
        this.scheduler = data.scheduler;
        if (this.scheduler.state.name === 'READY') {
            this.schedulerClass = 'label label-success';
            this.schedulerIcon = 'fa fa-check-circle';
        } else {
            this.schedulerClass = 'label label-default';
            this.schedulerIcon = 'fa fa-circle';
        }
    }

    ngOnInit() {
        const themeLink: HTMLLinkElement = <HTMLLinkElement> document.getElementById('theme-css');
        if (themeLink) {
            const theme = localStorage.getItem(this.THEME_KEY) || environment.defaultTheme;
            this.isLight = theme === 'light';
            this.themeTooltip = this.isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme';
            this.themeIcon = this.isLight ? 'fa fa-moon-o' : 'fa fa-sun-o';
            themeLink.href = `assets/themes/${theme}.css`;
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.isAuthenticated.currentValue === false) {
            const event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            this.profileOp.show(event, this.profile.nativeElement);
        }
    }
}
