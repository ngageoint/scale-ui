import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectItem, TreeNode } from 'primeng/primeng';
import * as _ from 'lodash';

import { JobTypesApiService } from './api.service';

@Component({
    selector: 'app-job-types',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class JobTypesComponent implements OnInit, OnDestroy {
    jobTypes: SelectItem[];
    selectedJobType: SelectItem;
    selectedJobTypeDetail: any;
    interfaceData: TreeNode[];
    chartConfig: any;
    routeParams: any;

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
        this.router.navigate([`/configuration/job-types/${e.value.id}`]);
    }
    ngOnInit() {
        this.jobTypes = [];
        let id = null;
        this.routeParams = this.route.paramMap.subscribe(params => {
            id = +params.get('id');
        });
        this.jobTypesApiService.getJobTypes().then(data => {
            _.forEach(data.results, (result) => {
                this.jobTypes.push({
                    label: result.title + ' ' + result.version,
                    value: result
                });
                if (id && id === result.id) {
                    this.selectedJobType = _.clone(result);
                }
            });
            if (id) {
                this.getJobTypeDetail(id);
            }
        });
    }
    ngOnDestroy() {
        this.routeParams.unsubscribe();
    }
}
