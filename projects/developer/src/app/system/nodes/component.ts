import { Component, OnInit } from '@angular/core';
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
    loading: boolean;
    allNodes: any = [];
    nodesStatus: any = [];
    nodes: any = [];
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

    private formatNodes() {
        this.nodes = _.filter(this.allNodes, result => {
            if (result.is_active === this.showActive) {
                result.status = _.find(this.nodesStatus, { id: result.id });
                result.menuItems = [
                    { label: result.pauseLabel, icon: result.pauseIcon, command: () => { this.onPauseClick(result); } },
                    { label: result.deprecateLabel, icon: result.deprecateIcon, command: () => { this.onDeprecateClick(result); } }
                ];
                return result;
            }
        });
        this.totalActive = this.showActive ? this.nodes.length : this.allNodes.length - this.nodes.length;
        this.totalDeprecated = !this.showActive ? this.nodes.length : this.allNodes.length - this.nodes.length;
        this.count = this.showActive ?
            `${this.totalActive} Active / ${this.totalDeprecated} Deprecated` :
            `${this.totalDeprecated} Deprecated / ${this.totalActive} Active`;
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

    onErrorsClick(node) {
        this.nodeErrors = node.status.errorData;
        this.errorDisplay = true;
    }

    onWarningsClick(node) {
        this.nodeWarnings = node.status.warningData;
        this.warningDisplay = true;
    }

    toggleShowActive() {
        this.activeLabel = this.showActive ? 'Active Nodes' : 'Deprecated Nodes';
        this.formatNodes();
        this.router.navigate(['/system/nodes'], {
            queryParams: { active: this.showActive },
            replaceUrl: true
        });
    }

    ngOnInit() {
        this.loading = true;
        this.route.queryParams.subscribe(params => {
            this.showActive = params.active ? params.active === 'true' : true;
            this.activeLabel = this.showActive ? 'Active Nodes' : 'Deprecated Nodes';
            this.getNodes();

            if (!params.active) {
                this.router.navigate(['/system/nodes'], {
                    queryParams: { active: this.showActive },
                    replaceUrl: true
                });
            }
        });
    }
}
