import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import { SelectItem } from 'primeng/api';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as Color from 'chartjs-color';

import { RecipeType } from './api.model';
import { RecipeExecution } from './execution.model';
import { RecipeTypesApiService } from './api.service';
import { DataService } from '../../common/services/data.service';
import { RecipeTypeInput } from '../../configuration/recipe-types/api.input.model';
import { RecipeTypeCondition } from '../../configuration/recipe-types/api.condition.model';
import { debuglog } from 'util';

@Component({
    selector: 'dev-job-details',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class GanttComponent implements OnInit, OnDestroy {
    subscription: any;
    recipe: RecipeType;
    loading: boolean;
    loadingInputs: boolean;
    loadingOutputs: boolean;
    loadingExecutions: boolean;
    jobInputs = [];
    jobOutputs = [];
    jobExecutions: any;
    jobStatus: string;
    exeStatus: string;
    options: any;
    data: any;
    selectedJobExe: any;
    logDisplay: boolean;
    inputClass = 'p-col-12';
    outputClass = 'p-col-12';
    recipeGraphMinHeight = '70vh';
    addRemoveDialogX: number;
    addRemoveDialogY: number;
    createForm: any;
    createFormSubscription: any;
    conditionForm: any;
    conditionFormSubscription: any;
    showFileInputs: boolean;
    showJsonInputs: boolean;
    showConditions: boolean;
    jobTypeColumns: any[];
    recipeTypeColumns: any[];
    loadingRecipeType: boolean;
    recipeTypeName: string;
    jobTypes: any;
    selectedJobTypes = [];
    recipeTypes: any; // used for adding/removing recipe nodes from recipe
    selectedRecipeTypes = []; // used for adding/removing recipe nodes from recipe
    recipeTypeOptions: SelectItem[]; // used for dropdown navigation between recipe types
    selectedRecipeTypeOption: SelectItem; // used for dropdown navigation between recipe types
    selectedRecipeTypeDetail: any;
    condition: any = RecipeTypeCondition.transformer(null);
    conditions: any = [];
    selectedConditions = [];
    conditionColumns: any[];
    showAddRemoveDisplay: boolean;
    addRemoveDisplayType = 'job';
    isEditing: boolean;
    labels: any = [];

    constructor(
        private route: ActivatedRoute,
        private messageService: MessageService,
        private recipesApiService: RecipeTypesApiService
    ) {}

    private initJobDetail(data) {
        this.recipe = data;
        this.recipe.id = 4;
        this.options = {
            elements: {
                font: 'Roboto',
                colorFunction: () => {
                    return Color('#017cce');
                }
            },
            scales: {
                xAxes: [{
                    type: 'timeline',
                    bounds: 'ticks',
                    ticks: {
                        callback: (value, index, values) => {
                            if (!values[index]) {
                                return;
                            }
                            return moment.utc(values[index]['value']).format('YYYY-MM-DD');
                        }
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: (tooltipItem, chartData) => {
                        const d = chartData.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                        return [
                            d[2],
                            moment.utc(d[0]).format('YYYY-MM-DD HH:mm'),
                            moment.utc(d[1]).format('YYYY-MM-DD HH:mm')
                        ];
                    }
                }
            },
            plugins: {
                datalabels: false,
                timeline: true
            },
            maintainAspectRatio: false
        };
for (let index = 0; index < data.results.length; index++) {


        this.data = {
            labels: [data.results[index].name],
            datasets: [{
                data: [
                    [data.results[index].created, data.results[index].deprecated,
                    DataService.calculateDuration(data.created, data.deprecated, true)]
                ]
        }]
        };
    }
}

    private getRecipeTypeDetail(name: string) {
        this.loadingRecipeType = true;
        this.recipesApiService.getRecipeType(name).subscribe(data => {
            this.loadingRecipeType = false;
            this.selectedRecipeTypeDetail = data;
            const jtArray = [];
            const jobNames = _.map(_.values(this.selectedRecipeTypeDetail.definition.nodes), 'node_type.job_type_name');
            _.forEach(this.jobTypes, jt => {
                if (_.includes(jobNames, jt.name)) {
                    jtArray.push(jt);
                }
            });
            this.selectedJobTypes = jtArray;
        }, err => {
            console.log(err);
            this.loadingRecipeType = false;
        });
    }

    private getRecipeTypes() {
        this.recipeTypeOptions = [];
        this.showAddRemoveDisplay = false;
        this.selectedRecipeTypes = [];
        this.recipesApiService.getRecipeTypes().subscribe(data => {
            this.recipeTypes = data.results;
            _.forEach(data.results, result => {
                this.recipeTypeOptions.push({
                    label: result.title,
                    value: result
                });
                if (this.recipeTypeName === result.name) {
                    this.selectedRecipeTypeOption = _.clone(result);
                }
            });
            if (this.recipeTypeName && this.recipeTypeName !== 'create') {
                this.isEditing = false;
                this.getRecipeTypeDetail(this.recipeTypeName);
            } else {
                if (this.recipeTypeName === 'create') {
                    this.selectedRecipeTypeOption = null;
                    this.selectedRecipeTypeDetail = new RecipeType(
                        null,
                        null,
                        'Untitled Recipe',
                        null,
                        true,
                        false,
                        null,
                        {
                            input: new RecipeTypeInput([], []),
                            nodes: {}
                        },
                        null,
                        null,
                        null,
                        null,
                        null
                    );
                }
            }
        });
    }


    private getJobDetail(id: number) {
        this.loading = true;
        this.subscription = this.recipesApiService.getRecipeTypes(id).subscribe(data => {
            this.loading = false;
            this.initJobDetail(data);

            // get job inputs
            this.loadingInputs = true;
            this.recipesApiService.getRecipeTypes(id)
                .subscribe(inputData => {
                    this.loadingInputs = false;
                    _.forEach(inputData.results, d => {
                        d.createdTooltip = DataService.formatDate(d.created);
                        d.createdDisplay = DataService.formatDate(d.created, true);
                        d.lastModifiedTooltip = DataService.formatDate(d.deprecated);
                        d.lastModifiedDisplay = DataService.formatDate(d.last_modified, true);
                    });
                    this.jobInputs = inputData.results;
                    this.inputClass = 'p-col-12';
                }, err => {
                    this.loadingInputs = false;
                    this.messageService.add({severity: 'error', summary: 'Error retrieving job inputs', detail: err.statusText});
                });

            // get job outputs
            this.loadingOutputs = true;
            this.recipesApiService.getRecipeTypes(id)
                .subscribe(outputData => {
                    this.loadingOutputs = false;
                    _.forEach(outputData.results, d => {
                        d.createdTooltip = DataService.formatDate(d.created);
                        d.createdDisplay = DataService.formatDate(d.created, true);
                        d.lastDeprecatedTooltip = DataService.formatDate(d.last_deprecated);
                        d.lastDeprecatedDisplay = DataService.formatDate(d.last_deprecated, true);
                    });
                    this.jobOutputs = outputData.results;
                    this.outputClass = 'p-col-12';
                }, err => {
                    this.loadingOutputs = false;
                    this.messageService.add({severity: 'error', summary: 'Error retrieving job outputs', detail: err.statusText});
                });

            // get job executions
            this.loadingExecutions = true;
            this.recipesApiService.getRecipeTypes(id)
                .subscribe(exeData => {
                    this.loadingExecutions = false;
                    this.jobExecutions = RecipeExecution.transformer(exeData.results);
                }, err => {
                    this.loadingExecutions = false;
                    this.messageService.add({severity: 'error', summary: 'Error retrieving job executions', detail: err.statusText});
                });
            }, err => {
                this.loading = false;
                this.messageService.add({severity: 'error', summary: 'Error retrieving job details', detail: err.statusText});
            });
    }

    calculateFileSize(fileSize) {
        return DataService.calculateFileSizeFromBytes(fileSize, 0);
    }

    getUnicode(code) {
        return `&#x${code};`;
    }

    showExeLog(event, exe) {
        this.selectedJobExe = exe;
        this.logDisplay = true;
    }

    hideExeLog() {
        this.selectedJobExe = null;
    }

    showStatus(statusPanel, $event) {
        statusPanel.show($event);
    }

    hideStatus(statusPanel) {
        statusPanel.hide();
    }

    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    ngOnInit() {
        const id = 4;
       this.getJobDetail(id);
    }

    ngOnDestroy() {
        this.unsubscribe();
    }
}
