import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';

import { NodesApiService } from './api.service';
import { StatusApiService } from '../../common/services/status/api.service';

@Component({
    selector: 'dev-nodes',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class NodesComponent implements OnInit {
    allNodes: any = [];
    nodesStatus: any = [];
    nodes: any = [];
    count = '';
    showActive: boolean;
    activeLabel: string;
    totalActive = 0;
    totalDeprecated = 0;
    items: MenuItem[] = [];
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
        private nodesApiService: NodesApiService,
        private statusApiService: StatusApiService
    ) {}

    private formatNodes() {
        this.nodes = _.filter(this.allNodes, result => {
            if (result.deprecated !== this.showActive) {
                result.status = _.find(this.nodesStatus, { id: result.id });
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
                this.formatNodes();
            });
        });
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
