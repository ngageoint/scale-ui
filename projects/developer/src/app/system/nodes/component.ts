import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';

import { NodesApiService } from './api.service';
import * as moment from '../../data/ingest/component';

@Component({
    selector: 'dev-nodes',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class NodesComponent implements OnInit {
    allNodes: any = [];
    nodes: any = [];
    count = 0;
    showActive: boolean;
    activeLabel: string;
    totalActive = 0;
    totalDeprecated = 0;
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private nodesApiService: NodesApiService
    ) {}

    private formatNodes() {
        this.nodes = _.filter(this.allNodes, result => {
            return result.is_active === this.showActive;
        });
        this.count = this.nodes.length;
        this.totalActive = this.showActive ? this.nodes.length : this.allNodes.length - this.nodes.length;
        this.totalDeprecated = !this.showActive ? this.nodes.length : this.allNodes.length - this.nodes.length;
    }

    private getNodes() {
        const params = {
            page: 1,
            page_size: 1000
        };
        this.nodesApiService.getNodes(params).subscribe(data => {
            this.allNodes = data.results;
            this.formatNodes();
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
