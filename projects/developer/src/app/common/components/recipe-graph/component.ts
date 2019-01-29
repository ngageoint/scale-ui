import {Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import * as shape from 'd3-shape';
import * as _ from 'lodash';

import { ColorService } from '../../services/color.service';
import { JobTypesApiService } from '../../../configuration/job-types/api.service';
import { JobType } from '../../../configuration/job-types/api.model';

@Component({
    selector: 'dev-recipe-graph',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class RecipeGraphComponent implements OnInit, OnChanges {
    @Input() recipeData: any;
    @Input() isEditing: boolean;
    @Input() jobMetrics: any;
    @Input() jobMetricsTitle: any;
    @Input() hideDetails: boolean;
    @ViewChild('dependencyPanel') dependencyPanel: any;
    @ViewChild('inputPanel') inputPanel: any;
    @ViewChild('recipeDialog') recipeDialog: any;
    jobTypes: any;
    columns: any[];
    dependencyOptions = [];
    nodeInputs = [];
    nodes = [];
    links = [];
    height: number;
    showLegend = false;
    orientation: string; // LR, RL, TB, BT
    curve: any;
    selectedJobType: any;
    selectedRecipeType: any;
    selectedNode: any;
    selectedNodeConnections = [];
    recipeDialogX: number;
    recipeDialogY: number;
    metricData: any;
    metricTotal = 0;
    chartOptions: any = {
        legend: {
            display: false
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
        }
    };
    constructor(
        private colorService: ColorService,
        private jobTypesApiService: JobTypesApiService
    ) {
        this.columns = [
            { field: 'title', header: 'Title', filterMatchMode: 'contains' }
        ];
        this.orientation = 'TB';
        this.curve = shape.curveBundle.beta(1);
        this.showLegend = false;
    }

    private updateRecipe() {
        if (this.recipeData) {
            // build nodes and links for DAG
            this.nodes = [{
                id: 'start',
                label: 'Start',
                name: 'start',
                icon: null,
                dependencies: [],
                visible: true,
                fillColor: this.colorService.RECIPE_NODE
            }];
            this.links = [];

            _.forEach(this.recipeData.definition.nodes, node => {
                let id = '';
                let label = '';
                let icon = '';
                if (node.node_type.node_type === 'job') {
                    const jobType: any = _.find(this.recipeData.job_types, {
                        name: node.node_type.job_type_name,
                        version: node.node_type.job_type_version
                    });
                    id = _.camelCase(node.node_type.job_type_name); // id can't have dashes or anything
                    label = `${jobType.title} v${jobType.version}`;
                    icon = String.fromCharCode(parseInt(jobType.icon_code, 16));
                } else if (node.node_type.node_type === 'recipe') {
                    id = _.camelCase(node.node_type.recipe_type_name); // id can't have dashes or anything
                    label = node.node_type.recipe_type_name;
                    icon = String.fromCharCode(parseInt('f1b3', 16)); // recipe type icon
                }
                this.nodes.push({
                    id: id,
                    label: label,
                    icon: icon,
                    dependencies: node.dependencies,
                    visible: true,
                    fillColor: node.node_type.status ? this.colorService[node.node_type.status] : this.colorService.RECIPE_NODE,
                    class: node.node_type.status ? node.node_type.status === 'RUNNING' ? 'throb-svg' : null : null,
                    node_type: node.node_type,
                    input: node.input
                });
            });

            _.forEach(this.nodes, node => {
                if (node.id !== 'start' && node.id !== 'end') {
                    if (node.dependencies.length === 0) {
                        // job has no dependencies, so link it to start
                        this.links.push({
                            source: 'start',
                            target: node.id,
                            node: node,
                            visible: true
                        });
                    } else {
                        _.forEach(node.dependencies, dependency => {
                            this.links.push({
                                source: _.camelCase(dependency.name),
                                target: node.id,
                                node: node,
                                visible: true
                            });
                        });
                    }
                }
            });
        }
    }

    private calculateMetricTotal(currValue) {
        let total = 0;
        const metricsValues = _.values(currValue);
        _.forEach(_.keys(metricsValues[0]), key => {
            total = total + _.sumBy(metricsValues, key);
        });
        return total;
    }

    private getNodeConnections() {
        this.selectedNodeConnections = [];
        _.forEach(this.selectedNode.input, i => {
            if (i.node) {
                const dependency = this.recipeData.definition.nodes[i.node];
                const dependencyJobType: any = _.find(this.recipeData.job_types, {
                    name: dependency.node_type.job_type_name,
                    version: dependency.node_type.job_type_version
                });
                const connection: any = _.find(dependencyJobType.manifest.job.interface.outputs.files, {name: i.output});
                this.selectedNodeConnections.push({
                    name: dependency.node_type.job_type_name,
                    output: connection.name
                });
            }
        });
    }

    select(e) {
        const shouldDeselect = _.isEqual(this.selectedNode, e);
        if (this.selectedNode) {
            this.selectedNode.options.stroke = '';
            this.selectedNode = null;
        }
        if (!shouldDeselect) {
            this.selectedNode = e;
            this.selectedNode.options.stroke = this.colorService.SCALE_BLUE1;
            if (this.selectedNode.node_type) {
                if (this.selectedNode.node_type.node_type === 'job') {
                    this.selectedRecipeType = null;
                    this.selectedJobType = _.find(this.recipeData.job_types, {
                        name: this.selectedNode.node_type.job_type_name,
                        version: this.selectedNode.node_type.job_type_version
                    });
                    this.getNodeConnections();

                    if (this.jobMetrics) {
                        const rawData = this.jobMetrics[this.selectedNode.node_type.job_type_name];
                        this.metricData = {
                            labels: ['Pending', 'Blocked', 'Queued', 'Running', 'Failed', 'Completed', 'Canceled'],
                            datasets: [
                                {
                                    data: [
                                        rawData.jobs_pending,
                                        rawData.jobs_blocked,
                                        rawData.jobs_queued,
                                        rawData.jobs_running,
                                        rawData.jobs_failed,
                                        rawData.jobs_completed,
                                        rawData.jobs_canceled
                                    ],
                                    backgroundColor: [
                                        this.colorService.PENDING,
                                        this.colorService.BLOCKED,
                                        this.colorService.QUEUED,
                                        this.colorService.RUNNING,
                                        this.colorService.FAILED,
                                        this.colorService.COMPLETED,
                                        this.colorService.CANCELED
                                    ],
                                    label: 'Jobs'
                                }
                            ]
                        };
                    }
                } else if (this.selectedNode.node_type.node_type === 'recipe') {
                    this.selectedJobType = null;
                    this.selectedRecipeType = _.find(this.recipeData.sub_recipe_types, {
                        name: this.selectedNode.node_type.recipe_type_name,
                        revision_num: this.selectedNode.node_type.recipe_type_revision
                    });
                    this.getNodeConnections();
                }
            }
        }
    }

    getUnicode(code) {
        return `&#x${code};`;
    }

    showDependencyOptions(event) {
        this.dependencyOptions = [];
        // only show job types present in recipe
        _.forEach(this.recipeData.definition.nodes, node => {
            const isJobNode = this.selectedNode.node_type.node_type === 'job';
            if (!isJobNode || node.node_type.job_type_name !== this.selectedJobType.name) {
                const jobType: any = _.find(this.recipeData.job_types, {
                    name: node.node_type.job_type_name,
                    version: node.node_type.job_type_version
                });
                if (jobType) {
                    // only show job types that are not yet dependencies
                    jobType.disabled = _.find(this.selectedNode.dependencies, { name: jobType.name });
                    this.dependencyOptions.push(jobType);
                }
            }
        });
        this.dependencyPanel.toggle(event);
    }

    addDependency(dependency) {
        if (dependency.disabled) {
            return;
        }
        // const currJob: any = this.getCurrJob();
        if (this.selectedNode) {
            this.selectedNode.dependencies.push({
                connections: [],
                name: dependency.name
            });
            dependency.disabled = true;
            // manually call updateRecipe
            this.updateRecipe();
        } else {
            console.log('node not selected');
        }
    }

    removeDependency(dependency) {
        // const currJob: any = this.getCurrJob();
        if (this.selectedNode) {
            _.remove(this.selectedNode.dependencies, dependency);
            this.updateRecipe();
        } else {
            console.log('node not selected');
        }
    }

    showInputConnections(event, input) {
        // inspect dependencies and display possible connections
        this.nodeInputs = [];
        _.forEach(this.selectedNode.dependencies, dep => {
            const jobType: any = _.find(this.recipeData.job_types, {
                name: dep.name
            });
            const inputConnection = {
                title: jobType.title,
                name: jobType.name,
                version: jobType.version,
                options: []
            };
            _.forEach(jobType.manifest.job.interface.outputs.files, output => {
                // only show the option if the output media type is contained in the input media types
                const inputMediaTypes = this.selectedNode.node_type.node_type === 'job' ?
                    input.mediaTypes :
                    this.selectedNode.node_type.node_type === 'recipe' ?
                        input.media_types :
                        [];
                const outputMediaType = this.selectedNode.node_type.node_type === 'job' ?
                    output.mediaType :
                    this.selectedNode.node_type.node_type === 'recipe' ?
                        output.media_type :
                        null;
                if (_.includes(inputMediaTypes, outputMediaType)) {
                    // disable the output if it currently exists as a connection
                    const hasOutput = _.find(_.values(this.selectedNode.input), { node: jobType.name, output: output.name });
                    output.disabled = !!hasOutput;
                    inputConnection.options.push(output);
                }
            });
            if (inputConnection.options.length > 0) {
                this.nodeInputs.push(inputConnection);
            }
        });
        this.inputPanel.toggle(event);
    }

    addInputConnection(providerName, providerVersion, providerOutput) {
        if (providerOutput.disabled) {
            return;
        }
        if (this.selectedNode) {
            // look for the current job input that matches the dependency's output
            let currType: any = null;
            if (this.selectedNode.node_type.node_type === 'job') {
                currType = _.find(this.recipeData.job_types, {
                    name: this.selectedNode.node_type.job_type_name,
                    version: this.selectedNode.node_type.job_type_version
                });
            } else if (this.selectedNode.node_type.node_type === 'recipe') {
                currType = _.find(this.recipeData.sub_recipe_types, {
                    name: this.selectedNode.node_type.recipe_type_name,
                    revision_num: this.selectedNode.node_type.recipe_type_revision
                });
            }
            if (currType) {
                const files = this.selectedNode.node_type.node_type === 'job' ?
                    currType.manifest.job.interface.inputs.files :
                    this.selectedNode.node_type.node_type === 'recipe' ?
                        currType.definition.input.files :
                        {};
                const currInput: any = _.find(files, file => {
                    // job manifest input has "mediaTypes", recipe definition has "media_types"
                    const inputMediaTypes = this.selectedNode.node_type.node_type === 'job' ?
                        file.mediaTypes :
                        this.selectedNode.node_type.node_type === 'recipe' ?
                            file.media_types :
                            [];
                    const outputMediaType = this.selectedNode.node_type.node_type === 'job' ?
                        providerOutput.mediaType :
                        this.selectedNode.node_type.node_type === 'recipe' ?
                            providerOutput.media_type :
                            null;
                    return _.includes(inputMediaTypes, outputMediaType);
                });
                if (currInput) {
                    // matching input exists, so add the connection
                    this.selectedNodeConnections.push({
                        name: providerName,
                        output: providerOutput.name
                    });
                    this.selectedNode.input[currInput.name] = {
                        type: 'dependency',
                        node: providerName,
                        output: providerOutput.name
                    };
                    // set output as disabled to prevent duplicate mappings
                    providerOutput.disabled = true;
                } else {
                    console.log('compatible media type not found');
                }
            } else {
                console.log('job or recipe type not found');
            }
        } else {
            console.log('node not selected');
        }
    }

    removeInputConnection(conn) {
        // const currJob: any = this.getCurrJob();
        if (this.selectedNode) {
            const currInput = _.findKey(this.selectedNode.input, { node: conn.name, output: conn.output });
            if (currInput) {
                // remove input
                _.remove(this.selectedNodeConnections, { name: conn.name, output: conn.output });
                this.selectedNode.input[currInput] = {};
            } else {
                console.log('input not found');
            }
        } else {
            console.log('node not selected');
        }
    }

    showDialog() {
        if (this.recipeDialogX && this.recipeDialogY) {
            this.recipeDialog.positionLeft = this.recipeDialogX;
            this.recipeDialog.positionTop = this.recipeDialogY;
        }
    }

    hideDialog() {
        const recipeDialogDiv: HTMLElement = document.querySelector('.recipe-dialog');
        this.recipeDialogX = recipeDialogDiv ? parseInt(recipeDialogDiv.style.left, 10) : null;
        this.recipeDialogY = recipeDialogDiv ? parseInt(recipeDialogDiv.style.top, 10) : null;

        if (this.selectedNode) {
            this.selectedNode.options.stroke = '';
            this.selectedNode = null;
        }
    }

    ngOnChanges(changes) {
        if (changes.jobMetrics) {
            this.metricTotal = this.calculateMetricTotal(changes.jobMetrics.currentValue);
        }
        if (changes.jobMetricsTitle) {
            this.chartOptions.title = {
                display: !!changes.jobMetricsTitle.currentValue,
                    text: changes.jobMetricsTitle.currentValue
            };
        }
        if (changes.recipeData) {
            this.jobTypesApiService.getJobTypes().subscribe(data => {
                this.jobTypes = data.results;
                this.selectedJobType = null;
                this.selectedNode = null;
                this.updateRecipe();
            }, err => {
                console.log(err);
            });
        }
    }

    ngOnInit() {
    }
}
