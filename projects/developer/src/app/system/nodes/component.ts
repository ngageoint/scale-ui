import { Component, OnInit } from '@angular/core';

import { NodesApiService } from './api.service';

@Component({
    selector: 'dev-nodes',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class NodesComponent implements OnInit {
    nodes: any = [];
    constructor(
        private nodesApiService: NodesApiService
    ) {}

    ngOnInit() {
        const params = {
            page: 1,
            page_size: 1000
        };
        this.nodesApiService.getNodes(params).subscribe(data => {
            console.log(data.results);
            this.nodes = data.results;
        });
    }
}
