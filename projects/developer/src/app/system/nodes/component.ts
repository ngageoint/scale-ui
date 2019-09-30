import { Component, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';

import { NodesApiService } from './api.service';
import { StatusService } from '../../common/services/status.service';

@Component({
    selector: 'dev-nodes',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class NodesComponent implements OnInit, OnDestroy {
    @ViewChild('menu') menu: any;
   
    subscription: any;
    loading: boolean;
    collapsed = true;
    collapseIcon = 'fa fa-minus';
    collapseTooltip = 'Collapse All Nodes';
    readyBtnClass = 'ui-button-ready';
    readyBtnIcon = 'fa fa-check';
    readyBtnLabel = 'Ready';
    pausedBtnClass = 'ui-button-paused';
    pausedBtnIcon = 'fa fa-check';
    pausedBtnLabel = 'Paused';
    deprecatedBtnClass = 'ui-button-deprecated';
    deprecatedBtnIcon = 'fa fa-check';
    deprecatedBtnLabel = 'Deprecated';
    offlineBtnClass = 'ui-button-offline';
    offlineBtnIcon = 'fa fa-check';
    offlineBtnLabel = 'Offline';
    degradedBtnClass = 'ui-button-degraded';
    degradedBtnIcon = 'fa fa-check';
    degradedBtnLabel = 'Degraded';
    initialCleanupBtnClass = 'ui-button-initial-cleanup';
    initialCleanupBtnIcon = 'fa fa-check';
    initialCleanupBtnLabel = 'Initial Cleanup';
    imagePullBtnClass = 'ui-button-image-pull';
    imagePullBtnIcon = 'fa fa-check';
    imagePullBtnLabel = 'Image Pull';
    schedulerStoppedBtnClass = 'ui-button-scheduler-stopped';
    schedulerStoppedBtnIcon = 'fa fa-check';
    schedulerStoppedBtnLabel = 'Scheduler Stopped';
    filters: any = {
        ready: true,
        paused: true,
        deprecated: true,
        offline: true,
        degraded: true,
        initial_cleanup: true,
        image_pull: true,
        scheduler_stopped: true
    };
    allNodes: any = [];
    nodesStatus: any = [];
    nodes: any = [];
    filteredNodes: any = [];
    selectedNode: any; //used by the context menu to determine the correct node
    count = '';
    showActive: boolean;
    activeLabel: string;
    totalActive = 0;
    totalDeprecated = 0;
    pauseDisplay = false;
    nodeToPause: any;
    errorDisplay = false;
    nodeErrors: any;
    warningDisplay = false;
    nodeWarnings: any;
    jobExeOptions = {
        legend: {
            display: false
        },
        title: {
            display: true,
            text: 'Job Executions'
        },
        scales: {
            xAxes: [{
                ticks: {
                    display: false
                }
            }],
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        },
        plugins: {
            datalabels: {
                display: false
            }
        },
        tooltips: {
            callbacks: {
                title: (tooltipItem, data) => {
                    if (tooltipItem && Array.isArray(tooltipItem) && tooltipItem.length > 0) {
                        const title = tooltipItem[0].xLabel;
                        return title === 'SYS' ? 'System Errors' :
                            title === 'ALG' ? 'Algorithm Errors' :
                                title === 'DATA' ? 'Data Errors' :
                                    title === 'COMP' ? 'Completed' : '';
                    }
                }
            }
        }
    };
    runningJobOptions = {
        legend: {
            display: false
        },
        title: {
            display: true,
            text: 'Running Jobs'
        },
        plugins: {
            datalabels: {
                display: false
            }
        }
    };
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService,
        private nodesApiService: NodesApiService,
        private statusService: StatusService
    ) {}

    private filterNodes() {
        if (this.showActive) {
            this.filteredNodes = _.filter(this.nodes, node => {
                if (node.status) {
                    const state = node.status.state.name.toLowerCase();
                    if (this.filters[state]) {
                        return node;
                    }
                }
            });
        } else {
            this.filteredNodes = _.clone(this.nodes);
        }
    }
    
    private formatNodes() {
        this.nodes = _.filter(this.allNodes, node => {
            if (node.is_active === this.showActive) {
                node.status = _.find(this.nodesStatus, { id: node.id });
                node.menuItems = [
                    { label: node.pauseLabel, icon: node.pauseIcon, command: () => { 
                        if(this.selectedNode) {
                            this.onPauseClick(this.selectedNode); 
                        }
                    } },
                    { label: node.deprecateLabel, icon: node.deprecateIcon, command: () => { 
                        if(this.selectedNode) {
                            this.onDeprecateClick(this.selectedNode); 
                        }
                    } }
                ];
                return node;
            }
        });        
        this.totalActive = this.showActive ? this.nodes.length : this.allNodes.length - this.nodes.length;
        this.totalDeprecated = !this.showActive ? this.nodes.length : this.allNodes.length - this.nodes.length;
        this.count = this.showActive ?
            `${this.totalActive} Active / ${this.totalDeprecated} Deprecated` :
            `${this.totalDeprecated} Deprecated / ${this.totalActive} Active`;
        const readyCount = _.countBy(this.nodes, { status: { state: { name: 'READY' } } });
        const pausedCount = _.countBy(this.nodes, { status: { state: { name: 'PAUSED' } } });
        const deprecatedCount = _.countBy(this.nodes, { status: { state: { name: 'DEPRECATED' } } });
        const offlineCount = _.countBy(this.nodes, { status: { state: { name: 'OFFLINE' } } });
        const degradedCount = _.countBy(this.nodes, { status: { state: { name: 'DEGRADED' } } });
        const initialCleanupCount = _.countBy(this.nodes, { status: { state: { name: 'INITIAL_CLEANUP' } } });
        const imagePullCount = _.countBy(this.nodes, { status: { state: { name: 'IMAGE_PULL' } } });
        const schedulerStoppedCount = _.countBy(this.nodes, { status: { state: { name: 'SCHEDULER_STOPPED' } } });
        this.readyBtnLabel = `Ready (${readyCount.true ? readyCount.true : 0})`;
        this.pausedBtnLabel = `Paused (${pausedCount.true ? pausedCount.true : 0})`;
        this.deprecatedBtnLabel = `Deprecated (${deprecatedCount.true ? deprecatedCount.true : 0})`;
        this.offlineBtnLabel = `Offline (${offlineCount.true ? offlineCount.true : 0})`;
        this.degradedBtnLabel = `Degraded (${degradedCount.true ? degradedCount.true : 0})`;
        this.initialCleanupBtnLabel = `Initial Cleanup (${initialCleanupCount.true ? initialCleanupCount.true : 0})`;
        this.imagePullBtnLabel = `Image Pull (${imagePullCount.true ? imagePullCount.true : 0})`;
        this.schedulerStoppedBtnLabel = `Scheduler Stopped (${schedulerStoppedCount.true ? schedulerStoppedCount.true : 0})`;
        this.filterNodes();
    }

    private getNodes() {
        console.log('getNodes');
        this.nodesApiService.getNodes().subscribe(nodeData => {
            this.allNodes = nodeData.results;
            this.loading = false;
            this.formatNodes();
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error retrieving nodes', detail: err.statusText});
            this.loading = false;
        });
    }

    private getNodesStatus() {
        if (!this.nodesStatus || this.nodesStatus.length === 0) {
            const status = this.statusService.getStatus();
            this.nodesStatus = status ? status.nodes : [];
            this.getNodes();
        }
        this.subscription = this.statusService.statusUpdated.subscribe(status => {
            this.nodesStatus = status.nodes;
            this.formatNodes();
        });
    }

    private updateQueryParams() {
        this.router.navigate(['/system/nodes'], {
            queryParams: {
                active: this.showActive,
                ready: this.filters.ready,
                paused: this.filters.paused,
                deprecated: this.filters.deprecated,
                offline: this.filters.offline,
                degraded: this.filters.degraded,
                initial_cleanup: this.filters.initial_cleanup,
                image_pull: this.filters.image_pull,
                scheduler_stopped: this.filters.scheduler_stopped,
                collapsed: this.collapsed
            },
            replaceUrl: true
        });
    }

    updateNode(node: any, action: string) {
        if (action === 'pause') {
            // handle pause update
            this.pauseDisplay = false;
            this.nodesApiService.updateNode(node).subscribe(data => {
                node.pauseLabel = data.is_paused ? 'Resume' : 'Pause';
                node.pauseIcon = data.is_paused ? 'fa fa-play' : 'fa fa-pause';
                node.menuItems[0].label = node.pauseLabel;
                node.menuItems[0].icon = node.pauseIcon;
                node.headerClass = data.is_paused ? 'node__paused' : '';
                this.messageService.add({severity: 'success', summary: 'Success', detail: 'Node has been successfully updated'});
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error updating node', detail: err.statusText});
            });
        } else {
            // handle deprecate update
            this.nodesApiService.updateNode(node).subscribe(data => {
                node.deprecateLabel = data.is_active ? 'Deprecate' : 'Activate';
                node.deprecateIcon = data.is_active ? 'fa fa-toggle-on' : 'fa fa-toggle-off';
                node.menuItems[1].label = node.deprecateLabel;
                node.menuItems[1].icon = node.deprecateIcon;
                this.formatNodes();
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error updating node', detail: err.statusText});
            });
        }
    }

    onPauseClick(node) {
        node.is_paused = !node.is_paused;
        if (node.is_paused) {
            this.nodeToPause = node;
            this.nodeToPause.pause_reason = '';
            this.pauseDisplay = true;
        } else {
            this.updateNode(node, 'pause');
        }
    }

    onDeprecateClick(node) {
        node.is_active = !node.is_active;
        this.updateNode(node, 'deprecate');
    }

    onErrorsClick(node, event) {
        this.nodeErrors = node.status.errorData;
        this.errorDisplay = true;
        event.stopPropagation();
    }

    onWarningsClick(node, event) {
        this.nodeWarnings = node.status.warningData;
        this.warningDisplay = true;
        event.stopPropagation();
    }

    onFilterBtnClick(type: string) {
        this.filters[type] = !this.filters[type];
        this.readyBtnClass = this.filters.ready ? 'ui-button-ready' : 'ui-button-secondary';
        this.readyBtnIcon = this.filters.ready ? 'fa fa-check' : 'fa fa-remove';
        this.pausedBtnClass = this.filters.paused ? 'ui-button-paused' : 'ui-button-secondary';
        this.pausedBtnIcon = this.filters.paused ? 'fa fa-check' : 'fa fa-remove';
        this.deprecatedBtnClass = this.filters.deprecated ? 'ui-button-deprecated' : 'ui-button-secondary';
        this.deprecatedBtnIcon = this.filters.deprecated ? 'fa fa-check' : 'fa fa-remove';
        this.offlineBtnClass = this.filters.offline ? 'ui-button-offline' : 'ui-button-secondary';
        this.offlineBtnIcon = this.filters.offline ? 'fa fa-check' : 'fa fa-remove';
        this.degradedBtnClass = this.filters.degraded ? 'ui-button-degraded' : 'ui-button-secondary';
        this.degradedBtnIcon = this.filters.degraded ? 'fa fa-check' : 'fa fa-remove';
        this.initialCleanupBtnClass = this.filters.initial_cleanup ? 'ui-button-initial-cleanup' : 'ui-button-secondary';
        this.initialCleanupBtnIcon = this.filters.initial_cleanup ? 'fa fa-check' : 'fa fa-remove';
        this.imagePullBtnClass = this.filters.image_pull ? 'ui-button-image-pull' : 'ui-button-secondary';
        this.imagePullBtnIcon = this.filters.image_pull ? 'fa fa-check' : 'fa fa-remove';
        this.schedulerStoppedBtnClass = this.filters.scheduler_stopped ? 'ui-button-scheduler-stopped' : 'ui-button-secondary';
        this.schedulerStoppedBtnIcon = this.filters.scheduler_stopped ? 'fa fa-check' : 'fa fa-remove';
        this.filterNodes();
        this.updateQueryParams();
    }

    onCollapseBtnClick() {
        this.collapsed = !this.collapsed;
        this.collapseIcon = this.collapsed ? 'fa fa-plus' : 'fa fa-minus';
        this.collapseTooltip = this.collapsed ? 'Expand All Nodes' : 'Collapse All Nodes';
        this.updateQueryParams();
    }

    onMenuClick(event, node) {
        this.menu.toggle(event);
        this.selectedNode = node;
        event.stopPropagation();
    }

    toggleShowActive() {
        this.activeLabel = this.showActive ? 'Active Nodes' : 'Deprecated Nodes';
        this.formatNodes();
        this.updateQueryParams();
    }

    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.loading = true;
        this.route.queryParams.subscribe(params => {
            this.showActive = params.active ? params.active === 'true' : true;
            this.filters.ready = params.ready ? params.ready === 'true' : true;
            this.filters.paused = params.paused ? params.paused === 'true' : true;
            this.filters.deprecated = params.deprecated ? params.deprecated === 'true' : true;
            this.filters.offline = params.offline ? params.offline === 'true' : true;
            this.filters.degraded = params.degraded ? params.degraded === 'true' : true;
            this.filters.initial_cleanup = params.initial_cleanup ? params.initial_cleanup === 'true' : true;
            this.filters.image_pull = params.image_pull ? params.image_pull === 'true' : true;
            this.filters.scheduler_stopped = params.scheduler_stopped ? params.scheduler_stopped === 'true' : true;
            this.collapsed = params.collapsed ? params.collapsed === 'true' : this.collapsed;
            this.activeLabel = this.showActive ? 'Active Nodes' : 'Deprecated Nodes';
            this.readyBtnClass = this.filters.ready ? 'ui-button-ready' : 'ui-button-secondary';
            this.readyBtnIcon = this.filters.ready ? 'fa fa-check' : 'fa fa-remove';
            this.pausedBtnClass = this.filters.paused ? 'ui-button-paused' : 'ui-button-secondary';
            this.pausedBtnIcon = this.filters.paused ? 'fa fa-check' : 'fa fa-remove';
            this.deprecatedBtnClass = this.filters.deprecated ? 'ui-button-deprecated' : 'ui-button-secondary';
            this.deprecatedBtnIcon = this.filters.deprecated ? 'fa fa-check' : 'fa fa-remove';
            this.offlineBtnClass = this.filters.offline ? 'ui-button-offline' : 'ui-button-secondary';
            this.offlineBtnIcon = this.filters.offline ? 'fa fa-check' : 'fa fa-remove';
            this.degradedBtnClass = this.filters.degraded ? 'ui-button-degraded' : 'ui-button-secondary';
            this.degradedBtnIcon = this.filters.degraded ? 'fa fa-check' : 'fa fa-remove';
            this.initialCleanupBtnClass = this.filters.initial_cleanup ? 'ui-button-initial-cleanup' : 'ui-button-secondary';
            this.initialCleanupBtnIcon = this.filters.initial_cleanup ? 'fa fa-check' : 'fa fa-remove';
            this.imagePullBtnClass = this.filters.image_pull ? 'ui-button-image-pull' : 'ui-button-secondary';
            this.imagePullBtnIcon = this.filters.image_pull ? 'fa fa-check' : 'fa fa-remove';
            this.schedulerStoppedBtnClass = this.filters.scheduler_stopped ? 'ui-button-scheduler-stopped' : 'ui-button-secondary';
            this.schedulerStoppedBtnIcon = this.filters.scheduler_stopped ? 'fa fa-check' : 'fa fa-remove';
            this.collapseIcon = this.collapsed ? 'fa fa-plus' : 'fa fa-minus';
            this.collapseTooltip = this.collapsed ? 'Expand All Nodes' : 'Collapse All Nodes';
            this.getNodesStatus();

            if (!params.active || !params.ready || !params.paused || !params.busy || !params.waiting || !params.collapsed) {
                this.updateQueryParams();
            }
        });
    }

    ngOnDestroy() {
        this.unsubscribe();
    }
}
