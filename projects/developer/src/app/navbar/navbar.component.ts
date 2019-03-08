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
    @Input() isAuthenticated: boolean;
    @ViewChild('op') op: OverlayPanel;
    @ViewChild('profile') profile: any;
    @ViewChild('user') usernameEl: any;
    auth = environment.auth;
    selectedId = null;
    subscription: any;
    isLight = true;
    themeTooltip = 'Switch to Dark Theme';
    themeIcon = 'fa fa-moon-o';
    username: string;
    password: string;

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

    handleOnShow() {
        setTimeout(() => {
            this.usernameEl.nativeElement.focus();
        }, 50);
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.isAuthenticated.currentValue === false) {
            const event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            this.op.show(event, this.profile.nativeElement);
        }
    }
}
