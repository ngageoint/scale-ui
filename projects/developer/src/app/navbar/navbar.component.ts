import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { OverlayPanel } from 'primeng/overlaypanel';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MenuItem } from 'primeng/api';
import * as _ from 'lodash';

import { environment } from '../../environments/environment';
import { DataService } from '../common/services/data.service';
import { ThemeService } from '../theme';
import { StatusService } from '../common/services/status.service';
import { SchedulerApiService } from '../common/services/scheduler/api.service';
import { ProfileService } from '../common/services/profile.service';

@Component({
    selector: 'dev-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit, OnChanges, OnDestroy {
    @Input() isAuthenticated: boolean;
    @Input() theme: string;
    @ViewChild('systemOp', { static: true }) systemOp: OverlayPanel;
    statusSubscription: any;
    selectedId = null;
    subscription: any;
    themeTooltip: string;
    themeIcon: string;
    scheduler: any;
    schedulerClass = 'navbar__scheduler-resume';
    schedulerStatusClass = '';
    schedulerStatusIcon: string;
    isMobile: boolean;
    itemsMobile: MenuItem[];
    is_paused: any;
    myComponentsIsAuthenticatedFlag: any;
    dependencyErrors: any;
    today: number = Date.now();


    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private dataService: DataService,
        private themeService: ThemeService,
        private statusService: StatusService,
        private schedulerApiService: SchedulerApiService,
        public breakpointObserver: BreakpointObserver,
        private profileService: ProfileService
    ) {
        this.profileService.isAuthenticated.subscribe(value => {
            this.myComponentsIsAuthenticatedFlag = value;
        });
        setInterval(() => { this.today = Date.now() }, 1);
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
        const active = this.themeService.getActiveTheme();
        const themeLink: HTMLLinkElement = <HTMLLinkElement>document.getElementById('theme-css');
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
                    { separator: true },
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
                    { separator: true },
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
                    { separator: true },
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
                    { separator: true },
                    {
                        label: 'Quit',
                        icon: 'fa fa-fw fa-times'
                    }
                ]
            },
            { separator: true },
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

    onSystemClick(event) {
        this.systemOp.toggle(event);
    }

    onSchedulerClick() {
        const action = this.is_paused ? 'resume' : 'pause';
        this.confirmationService.confirm({
            key: 'schedulerConfirm',
            message: `Are you sure that you want to ${action} the Scheduler?`,
            accept: () => {
                const params = {
                    is_paused: this.is_paused = !this.is_paused,
                    num_message_handlers: this.scheduler.num_message_handlers,
                    system_logging_level: this.scheduler.system_logging_level
                };
                this.schedulerApiService.updateScheduler(params).subscribe(() => {
                    this.schedulerClass = this.is_paused ? 'navbar__scheduler-pause' : 'navbar__scheduler-resume';
                    this.messageService.add({ severity: 'success', summary: 'Scheduler successfully updated' });
                }, err => {
                    console.log(err);
                    this.messageService.add({ severity: 'error', summary: 'Error updating scheduler', detail: err.statusText });
                });

            }
        });
    }

    ngOnInit() {
        this.breakpointObserver.observe(['(min-width: 1233px)']).subscribe((state: BreakpointState) => {
            this.isMobile = !state.matches;
        });
        if (this.myComponentsIsAuthenticatedFlag) {
            this.subscription = this.schedulerApiService.getScheduler(true).subscribe(schedulerData => {
                this.is_paused = schedulerData.is_paused;
                this.statusSubscription = this.statusService.statusUpdated.subscribe(data => {
                    if (data) {
                        this.scheduler = data.scheduler;
                        this.dependencyErrors = [];
                        _.forEach(data.dependencies, (dependent, key) => {
                            const errorTypes = [];
                            _.forEach(dependent.errors, (error) => {
                                _.forEach(error, (message, type) => {
                                    errorTypes.push({
                                        errorType: type,
                                        errorMessage: message
                                    });
                                });
                            });
                            if (errorTypes.length > 0) {
                                this.dependencyErrors.push({
                                    title: key,
                                    errors: errorTypes,
                                    description: dependent.detail.msg,
                                    ok: dependent.OK,
                                    details: dependent.detail,
                                    styleClass: 'system-status__unhealthy',
                                    icon: 'fa fa-warning'
                                });
                            }
                        });
                        this.scheduler.warnings = _.orderBy(this.scheduler.warnings, ['last_updated'], ['desc']);
                        if (this.scheduler.state.name === 'READY') {
                            this.schedulerStatusClass = 'label label-success';
                            this.schedulerStatusIcon = 'fa fa-check-circle';
                            if (this.is_paused === true) {
                                this.schedulerClass = 'navbar__scheduler-updating';
                            } else {
                                this.schedulerClass = 'navbar__scheduler-resume';
                                this.is_paused = false;
                            }
                        } else if (this.scheduler.state.name === 'PAUSED') {
                            this.schedulerStatusClass = 'label label-paused';
                            this.schedulerStatusIcon = 'fa fa-pause';
                            if (this.is_paused === false) {
                                this.schedulerClass = 'navbar__scheduler-updating';
                            } else {
                                this.schedulerClass = 'navbar__scheduler-pause';
                                this.is_paused = true;
                            }
                        } else {
                            this.schedulerStatusClass = 'label label-default';
                            this.schedulerStatusIcon = 'fa fa-circle';
                        }
                    }
                });
            }, err => {
                this.messageService.add({ severity: 'error', summary: 'Error retrieving ingests', detail: err.statusText });
            });
        }


        this.createMobileMenu();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.theme && changes.theme.currentValue) {
            this.themeTooltip = changes.theme.currentValue === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme';
            this.themeIcon = changes.theme.currentValue === 'light' ? 'fa fa-moon-o' : 'fa fa-sun-o';
            const themeLink: HTMLLinkElement = <HTMLLinkElement>document.getElementById('theme-css');
            if (themeLink) {
                themeLink.href = `assets/themes/${changes.theme.currentValue}.css`;
            }
        }
    }

    ngOnDestroy() {
        this.unsubscribe();
    }
}
