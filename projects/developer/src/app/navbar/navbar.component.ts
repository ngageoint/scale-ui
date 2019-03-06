import { Component, OnInit, ViewChild } from '@angular/core';
import { OverlayPanel } from 'primeng/primeng';

import { DataService } from '../common/services/data.service';

@Component({
    selector: 'dev-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {
    @ViewChild('op') op: OverlayPanel;
    @ViewChild('profile') profile: any;
    selectedId = null;
    subscription: any;
    isLight = true;
    themeTooltip = 'Switch to Dark Theme';
    themeIcon = 'fa fa-moon-o';
    isAuthenticated = null;

    constructor(
        private dataService: DataService
    ) {
        this.isAuthenticated = this.dataService.getIsAuthenticated();
    }

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

    ngOnInit() {
        if (this.isAuthenticated === false) {
            const event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            this.op.show(event, this.profile.nativeElement);
        }
    }
}
