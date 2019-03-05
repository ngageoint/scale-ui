import { Component, ViewChild } from '@angular/core';

@Component({
    selector: 'dev-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent {
    @ViewChild('themePanel') themePanel: any;
    @ViewChild('menu') menu: any;
    selectedId = null;
    subscription: any;
    isLight = true;
    themeIcon = 'fa fa-sun-o';
    menuItems: any;

    constructor() {
        this.menuItems = [
            { label: 'Profile', icon: 'fa fa-arrow-right', command: () => {  } },
            { label: 'Theme', icon: this.themeIcon, command: () => {  } }
        ];
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
        this.themeIcon = this.isLight ? 'fa fa-sun-o' : 'fa fa-moon-o';
        const theme = this.isLight ? 'light' : 'dark';
        themeLink.href = `assets/themes/${theme}.css`;
    }

    onMenuClick(event) {
        this.menu.toggle(event);
        event.stopPropagation();
    }
}
