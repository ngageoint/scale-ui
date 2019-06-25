import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import * as shape from 'd3-shape';
import * as _ from 'lodash';

import { ColorService } from '../../services/color.service';
import { JobsApiService } from '../../../processing/jobs/api.service';
import { MessageService } from 'primeng/components/common/messageservice';

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
        private jobsApiService: JobsApiService,
        private messageService: MessageService,
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
                let source = '';
                const sourceNode = this.recipeData.definition.nodes[dependency.name];
                if (sourceNode.node_type.node_type === 'job') {
                    source = _.camelCase(this.recipeData.definition.nodes[dependency.name].node_type.job_type_name);
                } else if (sourceNode.node_type.node_type === 'recipe') {
                    source = _.camelCase(this.recipeData.definition.nodes[dependency.name].node_type.recipe_type_name);
                } else if (sourceNode.node_type.node_type === 'condition') {
                    source = _.camelCase(dependency.name);
                }
                this.links.push({
                    source: source,
                    target: node.id,
                    node: node,
                    visible: true,
                    label: dependency.type === 'condition' ? dependency.acceptance.toString() : null
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
                fillColor: ColorService.RECIPE_NODE
            }];
            this.links = [];

            _.forEach(this.recipeData.definition.nodes, node => {
                let id = '';
                let label = '';
                let icon = '';
                let publisher = false;
                if (node.node_type.node_type === 'job') {
                    const jobType: any = _.find(this.recipeData.job_types, {
                        name: node.node_type.job_type_name,
                        version: node.node_type.job_type_version
                    });
                    id = _.camelCase(node.node_type.job_type_name); // id can't have dashes or anything
                    label = jobType ?
                        `${jobType.title} v${jobType.version}` :
                        `${node.node_type.job_type_name} v${node.node_type.job_type_version}`;
                    icon = jobType ? String.fromCharCode(parseInt(jobType.icon_code, 16)) : String.fromCharCode(parseInt('f1b2', 16));
                    publisher = jobType ? jobType.is_published : false;
                } else if (node.node_type.node_type === 'recipe') {
                    id = _.camelCase(node.node_type.recipe_type_name); // id can't have dashes or anything
                    label = `${node.node_type.recipe_type_name} rev. ${node.node_type.recipe_type_revision}`;
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
                    fillColor: node.node_type.status ? ColorService[node.node_type.status] : ColorService.RECIPE_NODE,
                    class: node.node_type.status ? node.node_type.status === 'RUNNING' ? 'throb-svg' : null : null,
                    transform: publisher ? 'skewX(-8)' : '',
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
                if (dependency.node_type.node_type === 'job') {
                    const dependencyJobType: any = _.find(this.recipeData.job_types, {
                        name: dependency.node_type.job_type_name,
                        version: dependency.node_type.job_type_version
                    });
                    const connection: any = _.find(dependencyJobType.manifest.job.interface.outputs.files, {name: i.output});
                    // use the key instead of the job type name to specify the connection name
                    const nodeKey = _.findKey(this.recipeData.definition.nodes, n => {
                        return n.node_type.job_type_name === dependency.node_type.job_type_name &&
                            n.node_type.job_type_version === dependency.node_type.job_type_version;
                    });
                    this.selectedNodeConnections.push({
                        name: nodeKey,
                        output: connection ? connection.name : null
                    });
                } else if (dependency.node_type.node_type === 'condition') {
                    // condition key and condition name are always the same
                    this.selectedNodeConnections.push({
                        name: dependency.node_type.name,
                        output: i.output
                    });
                }
            } else {
                const connection: any = _.find(this.recipeData.definition.input.files, {name: i.input});
                if (connection) {
                    this.selectedNodeConnections.push({
                        name: 'Start',
                        output: connection.name
                    });
                }
            }
        });
    }

    private getInputConnectionOptions(output, dependency): any {
        // disable the output if it currently exists as a connection
        const hasOutput = _.find(_.values(this.selectedNode.input), {node: dependency.name, output: output.name});
        output.disabled = !!hasOutput;
        return output;
    }

    select(e) {
        if (e.id === 'start') {
            return;
        }
        const shouldDeselect = _.isEqual(this.selectedNode, e);
        this.showRecipeDialog = !shouldDeselect;
        if (this.selectedNode) {
            this.selectedNode.options.stroke = '';
            this.selectedNode = null;
        }
        if (!shouldDeselect) {
            this.selectedNode = e;
            this.selectedNode.options.stroke = ColorService.SCALE_BLUE1;
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
                                        ColorService.PENDING,
                                        ColorService.BLOCKED,
                                        ColorService.QUEUED,
                                        ColorService.RUNNING,
                                        ColorService.FAILED,
                                        ColorService.COMPLETED,
                                        ColorService.CANCELED
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
                    const condition: any = _.find(this.recipeData.conditions, { name: node.node_type.name });
                    if (condition) {
                        // only show conditions that are not yet dependencies
                        const currDependency: any = _.find(this.selectedNode.dependencies, { name: condition.name });
                        condition.disabled = !!currDependency;
                        condition.acceptance = currDependency ? currDependency.acceptance : false;
                        this.dependencyOptions.push(condition);
                    }
                }
            }
        });
        this.dependencyPanel.toggle(event);
    }

    addDependency(event, dependency) {
        event.stopPropagation();
        if (dependency.disabled) {
            return;
        }
        if (this.selectedNode) {
            let dependencyName: any = '';
            if (dependency.manifest) {
                // retrieve the key of the job node to ensure correct mapping
                dependencyName = _.findKey(this.recipeData.definition.nodes, {
                    node_type: {
                        job_type_name: dependency.name,
                        job_type_version: dependency.version
                    }
                });
            } else {
                // with a condition node, the key is always the same as the name
                dependencyName = dependency.name;
            }
            if (this.selectedNode.node_type.node_type === 'condition' && dependency.manifest) {
                // inspect the dependency's input interface and apply it to the condition interface
                const files = this.selectedNode.node_type.interface.files || [];
                const json = this.selectedNode.node_type.interface.json || [];
                const input = this.selectedNode.input || {};
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
                    const key = _.has(input, f.name) ? `${f.name}-${dependency.manifest.job.name}` : f.name;
                    input[key] = {
                        node: dependencyName,
                        output: f.name,
                        type: 'dependency'
                    };
                });
                _.forEach(dependency.manifest.job.interface.outputs.json, j => {
                    const key = _.has(input, j.name) ? `${j.name}-${dependency.manifest.job.name}` : j.name;
                    input[key] = {
                        node: dependencyName,
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
                name: dependencyName,
                acceptance: dependency.acceptance || false,
                type: dependency.manifest ? 'jobType' : 'condition'
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
                    this.selectedCondition.interface = {
                        files: files,
                        json: json
                    };
                    this.selectedNode.node_type.interface = {
                        files: files,
                        json: json
                    };
                }
            }

            // remove the dependency
            _.remove(this.selectedNode.dependencies, dependency);

            // remove the dependency's input
            const key: any = _.findKey(this.selectedNode.input, { node: dependency.name });
            const input: any = _.find(this.selectedNode.input, { node: dependency.name });
            if (key && input) {
                if (this.selectedNode.node_type.node_type === 'condition') {
                    this.selectedNode.input = _.omitBy(this.selectedNode.input, input);
                } else {
                    this.selectedNode.input[key] = {};
                }

                // remove the dependency's connection
                _.remove(this.selectedNodeConnections, { name: input.node, output: input.output });
            }

            // redraw the recipe
            this.updateRecipe();
        } else {
            console.log('node not selected');
        }
    }

    showInputConnections(event, input) {
        this.nodeInputs = [];
        // inspect recipe type inputs and display possible connections
        _.forEach(this.recipeData.definition.input.files, file => {
            this.nodeInputs.push({
                title: null,
                name: 'Start',
                version: null,
                options: [file]
            });
        });
        _.forEach(this.recipeData.definition.input.json, json => {
            console.log(json);
        });
        // inspect dependencies and display possible connections
        _.forEach(this.selectedNode.dependencies, dep => {
            const jobType = this.getJobTypeFromNodeKey(dep.name);
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
                    const option = this.getInputConnectionOptions(output, jobType);
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
                    const option = this.getInputConnectionOptions(output, condition);
                    if (option) {
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
                _.forEach(files, file => {
                    this.selectedNodeConnections.push({
                        name: providerName,
                        output: providerOutput.name
                    });
                    if (this.selectedNode.dependencies.length === 0) {
                        // no dependencies means this is coming from the recipe input
                        this.selectedNode.input[file.name] = {
                            type: 'recipe',
                            input: providerOutput.name
                        };
                    } else {
                        this.selectedNode.input[file.name] = {
                            type: 'dependency',
                            node: providerName,
                            output: providerOutput.name
                        };
                    }
                    // TODO figure out a better way of preventing duplicate mappings
                    // set output as disabled to prevent duplicate mappings
                    // providerOutput.disabled = true;
                });
            } else {
                console.log('job or recipe type not found');
            }
        } else {
            console.log('node not selected');
        }
        this.inputPanel.hide();
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

    getJobTypeFromNodeKey(key) {
        const node = this.recipeData.definition.nodes[key];
        const jobType: any = _.find(this.recipeData.job_types, {
            name: node.node_type.job_type_name,
            version: node.node_type.job_type_version
        });
        return jobType;
    }

    getNodeTitle(key) {
        const jobType = this.getJobTypeFromNodeKey(key);
        if (jobType) {
            return `${jobType.title} v${jobType.version}`;
        }
        return key;
    }
    requeueJob() {
        this.jobsApiService.requeueJobs({job_ids: [this.selectedNode.node_type.job_id]}).subscribe(() => {
            this.messageService.add({severity: 'success', summary: 'Job requeue has been requested'});
        }, err => {
            this.messageService.add({severity: 'error', summary: 'Error requeuing job', detail: err.statusText});
        });
    }
    cancelJob() {
        this.jobsApiService.cancelJobs({job_ids: [this.selectedNode.node_type.job_id]}).subscribe(() => {
            this.messageService.add({severity: 'success', summary: 'Job cancellation has been requested'});
        }, err => {
            this.messageService.add({severity: 'error', summary: 'Error canceling jobs', detail: err.statusText});
        });
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
            // if the node details dialog is open when a node is removed from the recipe type, make sure it clears out
            if (this.selectedNode && this.showRecipeDialog) {
                this.selectedNode = null;
                this.showRecipeDialog = false;
            }

            // set selected type to null if it no longer exists in recipe type definition
            let node = null;
            if (this.selectedJobType) {
                node = _.find(changes.recipeData.currentValue.definition.nodes, {
                    node_type: {
                        job_type_name: this.selectedJobType.name
                    }
                });
                if (!node) {
                    this.selectedJobType = null;
                }
            } else if (this.selectedRecipeType) {
                node = _.find(changes.recipeData.currentValue.definition.nodes, {
                    node_type: {
                        recipe_type_name: this.selectedRecipeType.name
                    }
                });
                if (!node) {
                    this.selectedRecipeType = null;
                }
            } else if (this.selectedCondition) {
                node = _.find(changes.recipeData.currentValue.definition.nodes, {
                    node_type: {
                        name: this.selectedCondition.name
                    }
                });
                if (!node) {
                    this.selectedCondition.reset();
                    this.selectedCondition = null;
                }
            }
            this.updateRecipe();
        }
    }

    ngOnInit() {
    }
}
