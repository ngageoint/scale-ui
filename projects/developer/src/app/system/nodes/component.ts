import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';

import { NodesApiService } from './api.service';
import { StatusApiService } from '../../common/services/status/api.service';

@Component({
    selector: 'dev-nodes',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class NodesComponent implements OnInit {
    @ViewChild('menu') menu: any;
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
    busyBtnClass = 'ui-button-busy';
    busyBtnIcon = 'fa fa-check';
    busyBtnLabel = 'Busy';
    waitingBtnClass = 'ui-button-waiting';
    waitingBtnIcon = 'fa fa-check';
    waitingBtnLabel = 'Waiting';
    filters: any = {
        ready: true,
        paused: true,
        busy: true,
        waiting: true
    };
    allNodes: any = [];
    nodesStatus: any = [];
    nodes: any = [];
    filteredNodes: any = [];
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
        private statusApiService: StatusApiService
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
                    { label: node.pauseLabel, icon: node.pauseIcon, command: () => { this.onPauseClick(node); } },
                    { label: node.deprecateLabel, icon: node.deprecateIcon, command: () => { this.onDeprecateClick(node); } }
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
        const busyCount = _.countBy(this.nodes, { status: { state: { name: 'BUSY' } } });
        const waitingCount = _.countBy(this.nodes, { status: { state: { name: 'WAITING' } } });
        this.readyBtnLabel = `Ready (${readyCount.true ? readyCount.true : 0})`;
        this.pausedBtnLabel = `Paused (${pausedCount.true ? pausedCount.true : 0})`;
        this.busyBtnLabel = `Busy (${busyCount.true ? busyCount.true : 0})`;
        this.waitingBtnLabel = `Waiting (${waitingCount.true ? waitingCount.true : 0})`;
        this.filterNodes();
    }

    private getNodes() {
        this.statusApiService.getStatus().subscribe(data => {
            this.nodesStatus = data.nodes;
            this.nodesApiService.getNodes().subscribe(nodeData => {
                this.allNodes = nodeData.results;
                this.loading = false;
                this.formatNodes();
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error retrieving nodes', detail: err.statusText});
                this.loading = false;
            });
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error retrieving system status', detail: err.statusText});
            this.loading = false;
        });
    }

    private updateQueryParams() {
        this.router.navigate(['/system/nodes'], {
            queryParams: {
                active: this.showActive,
                ready: this.filters.ready,
                paused: this.filters.paused,
                busy: this.filters.busy,
                waiting: this.filters.waiting,
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
        this.busyBtnClass = this.filters.busy ? 'ui-button-busy' : 'ui-button-secondary';
        this.busyBtnIcon = this.filters.busy ? 'fa fa-check' : 'fa fa-remove';
        this.waitingBtnClass = this.filters.waiting ? 'ui-button-waiting' : 'ui-button-secondary';
        this.waitingBtnIcon = this.filters.waiting ? 'fa fa-check' : 'fa fa-remove';
        this.filterNodes();
        this.updateQueryParams();
    }

    onCollapseBtnClick() {
        this.collapsed = !this.collapsed;
        this.collapseIcon = this.collapsed ? 'fa fa-plus' : 'fa fa-minus';
        this.collapseTooltip = this.collapsed ? 'Expand All Nodes' : 'Collapse All Nodes';
        this.updateQueryParams();
    }

    onMenuClick(event) {
        this.menu.toggle(event);
        event.stopPropagation();
    }

    toggleShowActive() {
        this.activeLabel = this.showActive ? 'Active Nodes' : 'Deprecated Nodes';
        this.formatNodes();
        this.updateQueryParams();
    }

    ngOnInit() {
        this.loading = true;
        this.route.queryParams.subscribe(params => {
            this.showActive = params.active ? params.active === 'true' : true;
            this.filters.ready = params.ready ? params.ready === 'true' : true;
            this.filters.paused = params.paused ? params.paused === 'true' : true;
            this.filters.busy = params.busy ? params.busy === 'true' : true;
            this.filters.waiting = params.waiting ? params.waiting === 'true' : true;
            this.collapsed = params.collapsed ? params.collapsed === 'true' : this.collapsed;
            this.activeLabel = this.showActive ? 'Active Nodes' : 'Deprecated Nodes';
            this.readyBtnClass = this.filters.ready ? 'ui-button-ready' : 'ui-button-secondary';
            this.readyBtnIcon = this.filters.ready ? 'fa fa-check' : 'fa fa-remove';
            this.pausedBtnClass = this.filters.paused ? 'ui-button-paused' : 'ui-button-secondary';
            this.pausedBtnIcon = this.filters.paused ? 'fa fa-check' : 'fa fa-remove';
            this.busyBtnClass = this.filters.busy ? 'ui-button-busy' : 'ui-button-secondary';
            this.busyBtnIcon = this.filters.busy ? 'fa fa-check' : 'fa fa-remove';
            this.waitingBtnClass = this.filters.waiting ? 'ui-button-waiting' : 'ui-button-secondary';
            this.waitingBtnIcon = this.filters.waiting ? 'fa fa-check' : 'fa fa-remove';
            this.collapseIcon = this.collapsed ? 'fa fa-plus' : 'fa fa-minus';
            this.collapseTooltip = this.collapsed ? 'Expand All Nodes' : 'Collapse All Nodes';
            this.getNodes();

            if (!params.active || !params.ready || !params.paused || !params.busy || !params.waiting || !params.collapsed) {
                this.updateQueryParams();
            }
        });
    }
}
