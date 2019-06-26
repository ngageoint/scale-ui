import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { OverlayPanel } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MenuItem } from 'primeng/api';

import { environment } from '../../environments/environment';
import { DataService } from '../common/services/data.service';
import { ThemeService } from '../theme';
import { StatusService } from '../common/services/status.service';

@Component({
    selector: 'dev-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit, OnChanges, OnDestroy {
    @Input() isAuthenticated: boolean;
    @Input() theme: string;
    @ViewChild('systemOp') systemOp: OverlayPanel;
    statusSubscription: any;
    selectedId = null;
    subscription: any;
    themeTooltip: string;
    themeIcon: string;
    scheduler: any;
    statuses: any;
    statusAlerts = [];
    isMobile: boolean;
    itemsMobile: MenuItem[];

    constructor(
        private messageService: MessageService,
        private dataService: DataService,
        private themeService: ThemeService,
        private statusService: StatusService,
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

    onSystemClick(event) {
        this.systemOp.toggle(event);
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

    unsubscribe() {
        if (this.statusSubscription) {
            this.statusSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.breakpointObserver.observe(['(min-width: 1150px)']).subscribe((state: BreakpointState) => {
            this.isMobile = !state.matches;
        });

        this.statusSubscription = this.statusService.statusUpdated.subscribe(data => {
            this.statuses = data.statuses;
        });

        this.createMobileMenu();
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
    }

    ngOnDestroy() {
        this.unsubscribe();
    }
}
