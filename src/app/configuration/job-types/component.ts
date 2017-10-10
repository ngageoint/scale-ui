import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectItem, TreeNode } from 'primeng/primeng';
import * as _ from 'lodash';

import { JobTypesApiService } from './api.service';

@Component({
    selector: 'app-job-types',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class JobTypesComponent implements OnInit {
    jobTypes: SelectItem[];
    selectedJobType: SelectItem;
    selectedJobTypeDetail: any;
    interfaceData: TreeNode[];
    chartConfig: any;

    constructor(
        private jobTypesApiService: JobTypesApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.chartConfig = {
            cutoutPercentage: 75,
            rotation: 0.5 * Math.PI, // start from bottom
            legend: {
                display: false,
                position: 'bottom'
            },
            elements: {
                arc: {
                    borderWidth: 0
                }
            }
        };
    }

    private setInterfaceData(data) {
        const dataArr = [];
        _.forEach(data, (d) => {
            dataArr.push({
                data: d
            });
        });
        return dataArr;
    }
    private getJobTypeDetail(id: number) {
        this.jobTypesApiService.getJobType(id).then(data => {
            this.interfaceData = [
                {
                    data: {
                        name: 'Input Data',
                        type: '',
                        media_types: ''
                    },
                    children: this.setInterfaceData(data.job_type_interface.input_data)
                },
                {
                    data: {
                        name: 'Output Data',
                        type: '',
                        media_type: ''
                    },
                    children: this.setInterfaceData(data.job_type_interface.output_data)
                }
            ];
            this.selectedJobTypeDetail = data;
        });
    }

    getUnicode(code) {
        return `&#x${code};`;
    }
    onRowSelect(e) {
        this.router.navigate(['/configuration/job-types'], {
            queryParams: {
                id: e.value.id,
            },
            replaceUrl: true
        });
        this.getJobTypeDetail(e.value.id);
    }
    ngOnInit() {
        this.jobTypes = [];
        const params = this.route.snapshot ? this.route.snapshot.queryParams : { id: null };
        this.jobTypesApiService.getJobTypes().then(data => {
            _.forEach(data.results, (result) => {
                this.jobTypes.push({
                    label: result.title + ' ' + result.version,
                    value: result
                });
                if (params.id && parseInt(params.id, 10) === result.id) {
                    this.selectedJobType = _.clone(result);
                }
            });
            if (params.id) {
                this.getJobTypeDetail(params.id);
            }
        });
    }
}
