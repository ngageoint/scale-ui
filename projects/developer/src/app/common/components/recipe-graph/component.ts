import {Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import * as shape from 'd3-shape';
import * as _ from 'lodash';

import { ColorService } from '../../services/color.service';

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
    @Input() minHeight = '70vh';
    @ViewChild('dependencyPanel') dependencyPanel: any;
    @ViewChild('inputPanel') inputPanel: any;
    @ViewChild('recipeDialog') recipeDialog: any;
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
    selectedCondition: any;
    selectedNode: any;
    selectedNodeConnections = [];
    showMetrics: boolean;
    showRecipeDialog: boolean;
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
        private colorService: ColorService
    ) {
        this.columns = [
            { field: 'title', header: 'Title', filterMatchMode: 'contains' }
        ];
        this.orientation = 'TB';
        this.curve = shape.curveBundle.beta(1);
        this.showLegend = false;
    }

    private verifyNode(node) {
        // add link for dependency, if it exists
        _.forEach(node.dependencies, dependency => {
            if (this.recipeData.definition.nodes[dependency.name]) {
                this.links.push({
                    source: _.camelCase(dependency.name),
                    target: node.id,
                    node: node,
                    visible: true
                });
            } else {
                // dependency node was removed, so remove it from dependencies
                _.remove(node.dependencies, dependency);
            }
        });
        // check to make sure all connections are associated with nodes currently in the recipe
        _.forEach(node.input, input => {
            if (!this.recipeData.definition.nodes[input.node]) {
                // input node no longer exists, so remove the input connection
                _.remove(node.input, input);
            }
        });
        if (this.selectedNodeConnections) {
            _.forEach(this.selectedNodeConnections, connection => {
                if (!this.recipeData.definition.nodes[connection.name]) {
                    // connection node no longer exists, so remove it
                    _.remove(this.selectedNodeConnections, connection);
                }
            });
        }
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
                } else if (node.node_type.node_type === 'condition') {
                    id = _.camelCase(node.node_type.name); // id can't have dashes or anything
                    label = node.node_type.name;
                    icon = String.fromCharCode(parseInt('f042', 16)); // condition icon
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
                        this.verifyNode(node);
                    }
                }
            });

            if (this.selectedNode) {
                this.verifyNode(this.selectedNode);
            }
            console.log(this.recipeData);
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
                    output: connection ? connection.name : null
                });
            }
        });
    }

    private getInputConnectionOptions(input, output, dependency): any {
        // only show the option if the interface media type is contained in the input media types
        const inputMediaTypes = input.mediaTypes ? input.mediaTypes : input.media_types;
        const outputMediaType = output.mediaType ? output.mediaType : output.media_types;
        if (Array.isArray(outputMediaType)) {
            // dependency is a condition
            const outputArr = [];
            _.forEach(outputMediaType, type => {
                if (_.includes(inputMediaTypes, type)) {
                    // disable the output if it currently exists as a connection
                    const hasOutput = _.find(_.values(this.selectedNode.input), {node: dependency.name, output: output.name});
                    output.disabled = !!hasOutput;
                    outputArr.push(output);
                }
            });
            return outputArr;
        } else {
            if (_.includes(inputMediaTypes, outputMediaType)) {
                // disable the output if it currently exists as a connection
                const hasOutput = _.find(_.values(this.selectedNode.input), {node: dependency.name, output: output.name});
                output.disabled = !!hasOutput;
                return output;
            }
            return false;
        }
    }

    select(e) {
        const shouldDeselect = _.isEqual(this.selectedNode, e);
        this.showRecipeDialog = !shouldDeselect;
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
                    this.selectedCondition = null;
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
                    this.selectedCondition = null;
                    this.selectedRecipeType = _.find(this.recipeData.sub_recipe_types, {
                        name: this.selectedNode.node_type.recipe_type_name,
                        revision_num: this.selectedNode.node_type.recipe_type_revision
                    });
                    this.getNodeConnections();
                } else if (this.selectedNode.node_type.node_type === 'condition') {
                    this.selectedJobType = null;
                    this.selectedRecipeType = null;
                    this.selectedCondition = _.find(this.recipeData.conditions, {
                        name: this.selectedNode.node_type.name
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
        // only show options present in recipe
        _.forEach(this.recipeData.definition.nodes, node => {
            if (node.node_type.node_type === 'job') {
                // exclude the selected job type
                if ((this.selectedJobType && node.node_type.job_type_name !== this.selectedJobType.name) || !this.selectedJobType) {
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
            } else if (node.node_type.node_type === 'recipe') {
                // do nothing; recipe nodes can not be dependencies
            } else if (node.node_type.node_type === 'condition') {
                // exclude the selected condition
                if ((this.selectedCondition && node.node_type.name !== this.selectedCondition.name) || !this.selectedCondition) {
                    const condition: any = _.find(this.recipeData.conditions, {
                        name: node.node_type.name
                    });
                    if (condition) {
                        // only show conditions that are not yet dependencies
                        condition.disabled = _.find(this.selectedNode.dependencies, { name: condition.name });
                        this.dependencyOptions.push(condition);
                    }
                }
            }
        });
        this.dependencyPanel.toggle(event);
    }

    addDependency(dependency) {
        if (dependency.disabled) {
            return;
        }
        if (this.selectedNode) {
            if (this.selectedNode.node_type.node_type === 'condition' && dependency.manifest) {
                // inspect the dependency's input interface and apply it to the condition interface
                const files = [];
                const json = [];
                const input = {};
                const outputs = dependency.manifest.job.interface.outputs;
                // job type manifest files and json are slightly different, so just grab what we need
                if (outputs.files) {
                    _.forEach(outputs.files, f => {
                        files.push({
                            name: f.name,
                            required: f.required || null,
                            media_types: f.mediaType ? [f.mediaType] : [],
                            multiple: f.multiple || null
                        });
                    });
                }
                if (outputs.json) {
                    _.forEach(outputs.json, j => {
                        json.push({
                            name: j.name,
                            type: j.type,
                            required: j.required || null
                        });
                    });
                }
                _.forEach(dependency.manifest.job.interface.outputs.files, f => {
                    input[f.name] = {
                        node: dependency.name,
                        output: f.name,
                        type: 'dependency'
                    };
                });
                _.forEach(dependency.manifest.job.interface.outputs.json, j => {
                    input[j.name] = {
                        node: dependency.name,
                        output: j.name,
                        type: 'dependency'
                    };
                });
                // update interface in recipeData and selectedCondition
                this.recipeData.definition.nodes[this.selectedNode.node_type.name].node_type.interface = {
                    files: files,
                    json: json
                };
                this.selectedCondition.interface = {
                    files: files,
                    json: json
                };
                // update input in recipeData and selectedNode
                this.recipeData.definition.nodes[this.selectedNode.node_type.name].input = input;
                this.selectedNode.input = input;
                this.getNodeConnections();
            }
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
        if (this.selectedNode) {
            if (this.selectedNode.node_type.node_type === 'condition') {
                // remove the dependency's interface from the condition's interface
                const jobType: any = _.find(this.recipeData.job_types, {
                    name: dependency.name
                });
                if (jobType) {
                    jobType.disabled = false;
                    let files = this.selectedNode.node_type.interface.files;
                    let json = this.selectedNode.node_type.interface.json;
                    const outputs = jobType.manifest.job.interface.outputs;
                    if (outputs.files && files) {
                        _.forEach(outputs.files, outputFile => {
                            files = _.filter(files, f => {
                                return outputFile.name !== f.name;
                            });
                        });
                    }
                    if (outputs.json && json) {
                        _.forEach(outputs.json, outputJson => {
                            json = _.filter(json, j => {
                                return outputJson.name !== j.name;
                            });
                        });
                    }
                    this.selectedNode.node_type.interface = {
                        files: files,
                        json: json
                    };
                }
            }
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
            const condition: any = _.find(this.recipeData.conditions, {
                name: dep.name
            });
            let inputConnection = null;
            if (jobType) {
                inputConnection = {
                    title: jobType.title,
                    name: jobType.name,
                    version: jobType.version,
                    options: []
                };
                _.forEach(jobType.manifest.job.interface.outputs.files, output => {
                    const option = this.getInputConnectionOptions(input, output, jobType);
                    if (option) {
                        inputConnection.options.push(option);
                    }
                });
            } else {
                inputConnection = {
                    title: null,
                    name: condition.name,
                    version: null,
                    options: []
                };
                _.forEach(condition.interface.files, output => {
                    const option = this.getInputConnectionOptions(input, output, condition);
                    if (option && option.length > 0) {
                        inputConnection.options = inputConnection.options.concat(option);
                    }
                });
            }
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
            } else if (this.selectedNode.node_type.node_type === 'condition') {
                currType = _.clone(this.selectedNode.node_type);
            }
            if (currType) {
                const files = this.selectedNode.node_type.node_type === 'job' ?
                    currType.manifest.job.interface.inputs.files :
                    this.selectedNode.node_type.node_type === 'recipe' ?
                        currType.definition.input.files :
                        currType.interface.files;
                const currInput: any = _.find(files, file => {
                    // job manifest input has "mediaTypes", recipe definition has "media_types"
                    const inputMediaTypes = this.selectedNode.node_type.node_type === 'job' ? file.mediaTypes : file.media_types;
                    const outputMediaType = providerOutput.mediaType ? providerOutput.mediaType : providerOutput.media_types;
                    if (Array.isArray(outputMediaType)) {
                        return _.intersection(outputMediaType, inputMediaTypes).length > 0;
                    } else {
                        return _.includes(inputMediaTypes, outputMediaType);
                    }
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
            this.showMetrics = this.jobMetrics && typeof this.metricTotal === 'number';
        }
        if (changes.jobMetricsTitle) {
            this.chartOptions.title = {
                display: !!changes.jobMetricsTitle.currentValue,
                    text: changes.jobMetricsTitle.currentValue
            };
        }
        if (changes.recipeData) {
            if (this.selectedNode && this.showRecipeDialog) {
                if (!changes.recipeData.currentValue.definition.nodes[this.selectedNode.node_type.job_type_name]) {
                    // selected node is no longer in recipe
                    this.showRecipeDialog = false;
                    this.selectedJobType = null;
                    this.selectedNode = null;
                }
            }
            this.updateRecipe();
        }
    }

    ngOnInit() {
    }
}
