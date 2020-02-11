import { Component, Input, Output, OnChanges, OnInit, AfterViewInit, ViewChild, HostListener, EventEmitter } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subject } from 'rxjs';
import * as shape from 'd3-shape';
import * as _ from 'lodash';

import { ColorService } from '../../services/color.service';
import { JobsApiService } from '../../../processing/jobs/api.service';
import { BatchesApiService } from '../../../processing/batches/api.service';
import { Batch } from '../../../processing/batches/api.model';
import { BatchesDatatable } from '../../../processing/batches/datatable.model';
import { MessageService } from 'primeng/components/common/messageservice';
import { RecipeTypeInputFile } from '../../../configuration/recipe-types/api.input.file.model';
import { RecipeTypeInputJson } from '../../../configuration/recipe-types/api.input.json.model';

@Component({
    selector: 'dev-recipe-graph',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class RecipeGraphComponent implements OnInit, OnChanges, AfterViewInit {
    readonly minZoomLevel = 0.5;
    readonly maxZoomLevel = 2.0;
    readonly zoomStep = 0.1;

    @Input() recipeData: any;
    @Input() isEditing: boolean;
    @Input() batchesID: any;
    @Input() jobMetrics: any;
    @Input() jobMetricsTitle: any;
    @Input() hideDetails: boolean;
    @Input() height = '70vh';
    @Output() editCondition: EventEmitter<any> = new EventEmitter<any>();
    @Output() deleteCondition: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('dependencyPanel', {static: true}) dependencyPanel: any;
    @ViewChild('inputFilePanel', {static: true}) inputFilePanel: any;
    @ViewChild('inputJSONPanel', {static: true}) inputJSONPanel: any;
    @ViewChild('recipeDialog', {static: true}) recipeDialog: any;
    datatableOptions: BatchesDatatable;
    columns: any[];
    batchesColumns: any[];
    dependencyOptions = [];
    nodeInputs = [];
    nodes = [];
    links = [];
    showLegend = false;
    layoutSettings: any;
    curve: any;
    selectedJobType: any;
    selectedRecipeType: any;
    selectedCondition: any;
    selectedNode: any;
    filledInputs: any;
    totalInputs = 0;
    selectedNodeConnections = [];
    selectedNodeInput: any;
    showMetrics: boolean;
    showRecipeDialog: boolean;
    recipeDialogX: number;
    recipeDialogY: number;
    metricData: any;
    metricTotal = 0;
    zoomLevel = 1;
    zoomToFit: Subject<boolean> = new Subject();
    center: Subject<boolean> = new Subject();
    update: Subject<boolean> = new Subject();
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
    menuBarItems: MenuItem[] = [
        { label: 'Reset zoom', icon: 'fa fa-compress',
            command: () => {
                this.zoomToFit.next(true);
            }
        },
        { label: 'Center graph', icon: 'fa fa-align-center',
            command: () => {
                this.center.next(true);
                this.update.next(true);
            }
        },
    ];
    subscription: any;
    datatableLoading: boolean;
    selectedRows;
    batches: any;
    isBatches: boolean;
    tempData: any;
    tableData = [];

    constructor(
        private jobsApiService: JobsApiService,
        private batchesApiService: BatchesApiService,
        private messageService: MessageService,
    ) {
        this.columns = [
            { field: 'title', header: 'Title', filterMatchMode: 'contains' }
        ];
        this.layoutSettings = {
            orientation: 'TB',
            marginX: 0,
            marginY: 0,
        };
        this.curve = shape.curveBundle.beta(1);
        this.showLegend = false;

        this.batchesColumns = [
            { field: 'job_status', header: 'Job Status' },
            { field: 'job_count', header: 'Job Count' }
        ];
    }

    /**
     * Catches the MozMousePixelScroll event, which is not currently captured in ngx-graph.
     * Although deprecated, latest Firefox is still throwing this event. Disable it to prevent
     * page scrolling (event is thrown when zooming in the graph component).
     * @param  event MozMousePixelScroll event
     * @return       status of event
     */
    @HostListener('MozMousePixelScroll', ['$event'])
    onMozMouseWheel(event: any): boolean {
        if (event.preventDefault) {
            event.preventDefault();
        }
        event.stopPropagation();
        return false;
    }

    /**
     * Event when the zoom level has changed, fired by the graph component.
     * @param  event new zoom level amount
     */
    onZoomChange(event: any): void {
        this.zoomLevel = event;
    }

    /**
     * Event for when the zoom slider changes, updates the graph.
     * @param  event event containing originalEvent and value
     */
    onZoomSliderChange(event: any): void {
        this.update.next(true);
    }

    /**
     * Zooms out the graph by one zoom step level.
     */
    zoomOut(): void {
        this.zoomLevel = Math.max(this.minZoomLevel, this.zoomLevel - this.zoomStep);
        this.update.next(true);
    }

    /**
     * Zooms in the graph by one zoom step level.
     */
    zoomIn(): void {
        this.zoomLevel = Math.min(this.maxZoomLevel, this.zoomLevel + this.zoomStep);
        this.update.next(true);
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
            // connection node no longer exists, so remove it
            this.selectedNodeConnections = _.filter(this.selectedNodeConnections, (c) => {
                return c.name in this.recipeData.definition.nodes;
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
                fillColor: ColorService.RECIPE_NODE,
                textPosition: 10
            }];
            this.links = [];

            _.forEach(this.recipeData.definition.nodes, (node, key) => {
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
                    id = key || _.camelCase(node.node_type.recipe_type_name); // id can't have dashes or anything
                    const current_sub_recipe: any = _.find(this.recipeData.sub_recipe_types, {'name' : node.node_type.recipe_type_name});
                    label = `${current_sub_recipe.title}`;
                    icon = String.fromCharCode(parseInt('f1b3', 16)); // recipe type icon
                } else if (node.node_type.node_type === 'condition') {
                    // if there was no name loaded (names aren't saved to the db yet), use the key from the recipe
                    id = _.camelCase(node.node_type.name) || _.camelCase(key); // id can't have dashes or anything
                    label = node.node_type.name || key;
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
                    transform: publisher ? 'skewX(-32)' : '',
                    textPosition: publisher ? -3 : 10,
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
        this.getTotalConnections();
        this.selectedNodeConnections = [];
        const fileTypes = this.selectedNode.input;
        _.forEach(this.selectedNode.input, (i, inputKey) => {
            let inputFile;
            _.forEach(fileTypes, (file, key) => {
                if (file.output === i.output) {
                    inputFile = key;
                    let connection;
                        if (i.node) {
                            const dependency = this.recipeData.definition.nodes[i.node];
                            if (dependency) {
                                connection = _.find(this.recipeData.definition.input.files, {name: i.node});
                                if (dependency.node_type.node_type === 'job') {
                                    const dependencyJobType: any = _.find(this.recipeData.job_types, {
                                        name: dependency.node_type.job_type_name,
                                        version: dependency.node_type.job_type_version
                                    });
                                    const nodeKey = _.findKey(this.recipeData.definition.nodes, n => {
                                        return n.node_type.job_type_name === dependency.node_type.job_type_name &&
                                            n.node_type.job_type_version === dependency.node_type.job_type_version;
                                    });
                                    this.selectedNodeConnections.push({
                                        name: i.output,
                                        type: 'dependency',
                                        input_name: inputFile
                                    });
                                } else if (dependency.node_type.node_type === 'condition') {
                                    // condition key and condition name are always the same
                                    this.selectedNodeConnections.push({
                                        name: dependency.node_type.name,
                                        output:  i.output,
                                        input_name: inputFile
                                    });
                                }
                            } else {
                                connection = _.find(this.recipeData.definition.input.files, {name: i.output});
                                if (connection) {
                                    this.selectedNodeConnections.push({
                                        name: connection.name,
                                        type: 'recipe',
                                        input_name: inputFile
                                    });
                                }
                            }
                    } else if (this.selectedNode.node_type.job_type_name) {
                        _.forEach(this.recipeData.job_types, j => {
                            if ((this.selectedNode.node_type.job_type_name === j.name)) {
                                _.forEach(j.manifest.job.interface.inputs, (fileInput, typeKey) => {
                                    let connectionTemp;
                                    if (typeKey === 'files') {
                                        connectionTemp = _.find(this.recipeData.definition.input.files, {name: i.input});
                                    } else if (typeKey === 'json') {
                                        connectionTemp = _.find(this.recipeData.definition.input.json, {name: i.input});
                                    }
                                    if (connectionTemp) {
                                        if (!_.isEmpty(this.selectedNode.input[inputFile])
                                        && (inputKey === inputFile)) {
                                            if (!_.find(this.selectedNodeConnections, {name: connectionTemp.name})) {
                                                this.selectedNodeConnections.push({
                                                    name: connectionTemp.name,
                                                    type: 'recipe',
                                                    input_name: inputFile
                                                });
                                            }
                                    }
                                    }

                                });
                            }
                        });
                    } else {
                            if (connection) {
                                this.selectedNodeConnections.push({
                                    name: connection.name,
                                    type: 'recipe',
                                    input_name: inputFile
                                });
                            }
                    }
            }
            });
        });
    }
    private getTotalConnections() {
        this.totalInputs = 0;

        let inputs;
        if (this.selectedJobType) {
            inputs = this.selectedJobType.manifest.job.interface.inputs;
        } else if (this.selectedRecipeType) {
            inputs = this.selectedRecipeType.definition.input;
        } else if (this.selectedCondition) {
            inputs = this.selectedCondition.interface;
        }

        if (inputs.json  && inputs.files) {
            this.totalInputs = inputs.json.length + inputs.files.length;
        } else if (inputs.json) {
            this.totalInputs = inputs.json.length;
        } else if (inputs.files) {
            this.totalInputs = inputs.files.length;
        }
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
            this.getTotalConnections();
            this.selectedNode.data.stroke = '';
            this.selectedNode = null;
        }
        if (!shouldDeselect) {
            this.selectedNode = e;
            this.selectedNode.data.stroke = ColorService.COMPLETED;
            if (this.selectedNode.node_type) {
                if (this.selectedNode.node_type.node_type === 'job') {
                    this.selectedRecipeType = null;
                    this.selectedCondition = null;
                    this.selectedJobType = _.find(this.recipeData.job_types, {
                        name: this.selectedNode.node_type.job_type_name,
                        version: this.selectedNode.node_type.job_type_version
                    });
                    this.getNodeConnections();
                } else if (this.selectedNode.node_type.node_type === 'recipe') {
                    this.selectedJobType = null;
                    this.selectedCondition = null;
                    this.selectedRecipeType = _.find(this.recipeData.sub_recipe_types, {
                        name: this.selectedNode.node_type.recipe_type_name,
                        // TODO commented out the following line
                        //   sub_recipe_types is a live pointer to objects but the original definition
                        //   has the original revisions used instead
                        // revision_num: this.selectedNode.node_type.recipe_type_revision
                    });
                    // TODO added, see note above
                    this.selectedRecipeType.revision_num = this.selectedNode.node_type.recipe_type_revision;

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
                } else if (this.selectedNode.node_type.node_type === 'condition') {
                    this.selectedJobType = null;
                    this.selectedRecipeType = null;
                    this.selectedCondition = _.find(this.recipeData.conditions, {
                        name: this.selectedNode.label
                    });
                    this.getNodeConnections();
                }
            }
        }
        if (this.isBatches) {
            console.log(this.selectedJobType);
            this.getTableData();
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
                        condition.acceptance = true;
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
                const outputs = dependency.manifest.job.interface ?
                                dependency.manifest.job.interface.outputs || []
                                : [];
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
                _.forEach(outputs.files, f => {
                    const key = _.has(input, f.name) ? `${f.name}-${dependency.manifest.job.name}` : f.name;
                    input[key] = {
                        node: dependencyName,
                        output: f.name,
                        type: 'dependency'
                    };
                });
                _.forEach(outputs.json, j => {
                    const key = _.has(input, j.name) ? `${j.name}-${dependency.manifest.job.name}` : j.name;
                    input[key] = {
                        node: dependencyName,
                        output: j.name,
                        type: 'dependency'
                    };
                });
                // update interface in recipeData and selectedCondition
                this.recipeData.definition.nodes[this.selectedNode.node_type.name].node_type.interface = {
                    files: RecipeTypeInputFile.transformer(files),
                    json: RecipeTypeInputJson.transformer(json)
                };
                this.selectedCondition.interface = {
                    files: RecipeTypeInputFile.transformer(files),
                    json: RecipeTypeInputJson.transformer(json)
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
                    const outputs = jobType.manifest.job.interface ?
                                jobType.manifest.job.interface.outputs || []
                                : [];
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
        this.selectedNodeInput = input;
        this.nodeInputs = [];
        // inspect recipe type inputs and display possible connections
        _.forEach(this.recipeData.definition.input.files, file => {
            this.nodeInputs.push({
                title: null,
                name: 'recipe',
                version: null,
                options: [file]
            });
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
        this.inputFilePanel.toggle(event);
    }

    showJsonInputConnections(event, input) {
        this.selectedNodeInput = input;
        this.nodeInputs = [];
        // inspect recipe type inputs and display possible connections
        _.forEach(this.recipeData.definition.input.json, json => {
            this.nodeInputs.push({
                title: null,
                name: 'recipe',
                version: null,
                options: [json]
            });
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
                _.forEach(jobType.manifest.job.interface.outputs.json, output => {
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
                _.forEach(condition.interface.json, output => {
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
        this.inputJSONPanel.toggle(event);
    }

    addJSONConnection(providerName, providerOutput) {
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
                const jsonInputs = this.selectedNode.node_type.node_type === 'job' ?
                    currType.manifest.job.interface.inputs.json :
                    this.selectedNode.node_type.node_type === 'recipe' ?
                        currType.definition.input.json :
                        currType.interface.json;
                    _.forEach(jsonInputs, json => {
                        if (json.name === this.selectedNodeInput.name) {
                            let isRecipe = false;
                            this.nodeInputs.forEach(nodeInput => {
                                nodeInput.options.forEach(option => {
                                    if (option.name === providerOutput.name && nodeInput.name === 'recipe') {
                                         isRecipe = true;
                                    }
                                });
                            });
                            if (isRecipe) {
                                this.selectedNodeConnections.push({
                                    type: 'recipe',
                                    name: providerOutput.name,
                                    input_name: this.selectedNodeInput.name
                                });
                                // no dependencies means this is coming from the recipe input
                                this.selectedNode.input[this.selectedNodeInput.name] = {
                                    type: 'recipe',
                                    input: providerOutput.name,
                                    input_name: this.selectedNodeInput.name
                                };
                            } else {
                                this.selectedNodeConnections.push({
                                    type: 'dependency',
                                    name: providerOutput.name,
                                    input_name: this.selectedNodeInput.name
                                });
                                this.selectedNode.input[this.selectedNodeInput.name] = {
                                    type: 'dependency',
                                    node: providerName,
                                    output: providerOutput.name,
                                    input_name: this.selectedNodeInput.name
                                };
                            }
                        }
                    });

            } else {
                console.log('job or recipe type not found');
            }
        } else {
            console.log('node not selected');
        }
        this.selectedNodeInput = [];
        this.inputFilePanel.hide();
    }

    addInputConnection(providerName, providerOutput) {
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
                        if (file.name === this.selectedNodeInput.name) {
                            let isRecipe = false;
                            this.nodeInputs.forEach(nodeInput => {
                                nodeInput.options.forEach(option => {
                                    if (option.name === providerOutput.name && nodeInput.name === 'recipe') {
                                         isRecipe = true;
                                    }
                                });
                            });
                            if (isRecipe) {
                                this.selectedNodeConnections.push({
                                    type: 'recipe',
                                    name: providerOutput.name,
                                    input_name: this.selectedNodeInput.name
                                });
                                // no dependencies means this is coming from the recipe input
                                this.selectedNode.input[this.selectedNodeInput.name] = {
                                    type: 'recipe',
                                    input: providerOutput.name,
                                    input_name: this.selectedNodeInput.name
                                };
                            } else {
                                this.selectedNodeConnections.push({
                                    type: 'dependency',
                                    name: providerOutput.name,
                                    input_name: this.selectedNodeInput.name
                                });
                                this.selectedNode.input[this.selectedNodeInput.name] = {
                                    type: 'dependency',
                                    node: providerName,
                                    output: providerOutput.name,
                                    input_name: this.selectedNodeInput.name
                                };
                            }
                        }
                    });

            } else {
                console.log('job or recipe type not found');
            }
        } else {
            console.log('node not selected');
        }
        this.selectedNodeInput = [];
        this.inputFilePanel.hide();
    }

    removeInputConnection(conn) {
        // const currJob: any = this.getCurrJob();
        if (this.selectedNode) {
            let currInput;
            _.forEach(this.selectedNode.input, node => {
                if (node.type === 'dependency') {
                    currInput = _.findKey(this.selectedNode.input, function(dependentInput) {
                        return dependentInput.input_name === conn.input_name || dependentInput.output === conn.name;
                    });
                } else {
                    currInput = _.findKey(this.selectedNode.input, function(standardInput) {
                        return standardInput.input === conn.name; });
                }
                if (currInput) {
                    // remove input
                    _.remove(this.selectedNodeConnections, { name: conn.name });
                    this.selectedNode.input[currInput] = {};
                } else {
                    console.log('input not found');
                }
            });
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
            this.selectedNode.data.stroke = '';
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
    getTableData() {
        this.tempData = [];
        this.subscription = this.batchesApiService.getBatch(this.batchesID).subscribe(data => {
            this.datatableLoading = false;
                _.forEach(data.job_metrics, (jobType, key) => {
                    if (key === this.selectedJobType.name) {
                        this.tempData.push({
                            job_status: 'Pending',
                            job_count: jobType.jobs_pending
                        });
                        this.tempData.push({
                            job_status: 'Blocked',
                            job_count: jobType.jobs_blocked
                        });
                        this.tempData.push({
                            job_status: 'Queued',
                            job_count: jobType.jobs_queued
                        });
                        this.tempData.push({
                            job_status: 'Running',
                            job_count: jobType.jobs_running
                        });
                        this.tempData.push({
                            job_status: 'Completed',
                            job_count: jobType.jobs_completed
                        });
                        this.tempData.push({
                            job_status: 'Canceled',
                            job_count: jobType.jobs_canceled
                        });
                        this.tempData.push({
                            job_status: 'Failed',
                            job_count: jobType.jobs_failed
                        });
                        this.tempData.push({
                            job_status: 'Total',
                            job_count: jobType.jobs_total
                        });

                    }
            });
            this.batches = Batch.transformer(data.results);
            this.tableData = this.tempData;
        }, err => {
            this.datatableLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving batches', detail: err.statusText});
        });

    }

    /**
     * Click handler for edit button in header of condition dialog.
     */
    editConditionClick(): void {
        this.editCondition.next(this.selectedCondition);
    }

    /**
     * Click event handler for delete button in header of condition dialog.
     */
    deleteConditionClick(): void {
        this.deleteCondition.next(this.selectedCondition);
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
        const location = window.location.href;
        if (location.includes('batches')) {
            this.isBatches = true;
        }
    }

    ngAfterViewInit() {
        // reset the viewport outside of lifecycle hooks
        setTimeout(() => {
            this.zoomToFit.next(true);
            this.center.next(true);
            this.update.next(true);
        }, 0);
    }
}
