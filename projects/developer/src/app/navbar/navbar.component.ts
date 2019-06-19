import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { OverlayPanel } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import {MenuItem} from 'primeng/api';
import * as _ from 'lodash';

import { environment } from '../../environments/environment';
import { ProfileService } from '../common/services/profile.service';
import { DataService } from '../common/services/data.service';
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
    @ViewChild('schedulerOp') schedulerOp: OverlayPanel;
    @ViewChild('profile') profile: any;
    @ViewChild('user') usernameEl: any;
    env = environment;
    selectedId = null;
    subscription: any;
    themeTooltip: string;
    themeIcon: string;
    username: string;
    password: string;
    scheduler: any;
    schedulerClass: string;
    schedulerIcon: string;
    schedulerWarningsCount: number;
    schedulerWarningsLabelVisible = true;
    userProfile: any;
    isMobile: boolean;
    itemsMobile: MenuItem[];

    constructor(
        private messageService: MessageService,
        private profileService: ProfileService,
        private dataService: DataService,
        private themeService: ThemeService,
        public breakpointObserver: BreakpointObserver
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

    onSchedulerClick(event) {
        this.schedulerWarningsLabelVisible = false;
        this.profileOp.hide();
        this.schedulerOp.toggle(event);
    }

    onProfileClick(event) {
        this.schedulerOp.hide();
        this.profileOp.toggle(event);
    }

    createMobileMenu() {
        this.itemsMobile = [
            {
                label: 'Processing',
                icon: 'fa fa-fw fa-gears',
                items: [
                    {
                        label: 'Jobs',
                        icon: 'fa fa-fw fa-cube',
                        url: '/processing/jobs'
                    },
                    {
                        label: 'Recipes',
                        icon: 'fa fa-fw fa-cube',
                        url: '/processing/recipes'
                    },
                    {
                        label: 'Running Jobs',
                        icon: 'fa fa-fw fa-arrow-circle-right',
                        url: '/processing/running-jobs'
                    },
                    {
                        label: 'Queued Jobs',
                        icon: 'fa fa-fw fa-clock-o',
                        url: '/processing/queued-jobs'
                    },
                    {
                        label: 'Job Type History',
                        icon: 'fa fa-fw fa-history',
                        url: '/processing/job-type-history'
                    },
                    {
                        label: 'Batches',
                        icon: 'fa fa-fw fa-files-o',
                        url: '/processing/batches'
                    },
                    {separator: true},
                    {
                        label: 'Close',
                        icon: 'fa fa-fw fa-times'
                    }
                ]
            },
            {
                label: 'Data',
                icon: 'fa fa-fw fa-hdd-o',
                items: [
                    {
                        label: 'Feed',
                        icon: 'fa fa-fw fa-line-chart',
                        url: '/data/feed'
                    },
                    {
                        label: 'Ingest Records',
                        icon: 'fa fa-fw fa-clone',
                        url: '/data/ingest'
                    },
                    {
                        label: 'Metrics',
                        icon: 'fa fa-fw fa-bar-chart',
                        url: '/data/metrics'
                    },
                    {
                        label: 'Timeline',
                        icon: 'fa fa-fw fa-calendar',
                        url: '/data/timeline'
                    },
                    {separator: true},
                    {
                        label: 'Close',
                        icon: 'fa fa-fw fa-times'
                    }
                ]
            },
            {
                label: 'Configuration',
                icon: 'fa fa-fw fa-wrench',
                items: [
                    {
                        label: 'Job Types',
                        icon: 'fa fa-fw fa-cube',
                        url: '/configuration/job-types'
                    },
                    {
                        label: 'Recipe Types',
                        icon: 'fa fa-fw fa-cubes',
                        url: '/configuration/recipe-types'
                    },
                    {separator: true},
                    {
                        label: 'Close',
                        icon: 'fa fa-fw fa-times'
                    }
                ]
            },
            {
                label: 'System',
                icon: 'fa fa-fw fa-television',
                items: [
                    {
                        label: 'Nodes',
                        icon: 'fa fa-fw fa-circle-o',
                        url: '/system/nodes'
                    },
                    {
                        label: 'Scans',
                        icon: 'fa fa-fw fa-barcode',
                        url: '/system/scans'
                    },
                    {
                        label: 'Strikes',
                        icon: 'fa fa-fw fa-bolt',
                        url: '/system/strikes'
                    },
                    {
                        label: 'Workspaces',
                        icon: 'fa fa-fw fa-database',
                        url: '/system/workspaces'
                    },
                    {separator: true},
                    {
                        label: 'Quit',
                        icon: 'fa fa-fw fa-times'
                    }
                ]
            },
            {separator: true},
            {
                label: 'Close',
                icon: 'fa fa-fw fa-times'
            }
        ];
    }

    onStatusChange(data) {
        if (data) {
            if (this.scheduler) {
                let warningsDiff = [];
                // we only care about new warnings
                if (this.scheduler.warnings.length <= data.scheduler.warnings.length) {
                    warningsDiff = _.filter(data.scheduler.warnings, warn => {
                        return _.findIndex(this.scheduler.warnings, warn) < 0;
                    });
                }
                this.schedulerWarningsCount = this.schedulerWarningsLabelVisible ?
                    data.scheduler.warnings.length :
                    warningsDiff.length;
                this.schedulerWarningsLabelVisible = this.schedulerWarningsCount > 0;
            } else {
                this.schedulerWarningsCount = data.scheduler.warnings.length;
            }
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
    }

    ngOnInit() {
        this.breakpointObserver.observe(['(min-width: 1150px)']).subscribe((state: BreakpointState) => {
            this.isMobile = !state.matches;
        });

        this.createMobileMenu();
        this.userProfile = this.dataService.getUserProfile();
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
