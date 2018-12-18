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
    @ViewChild('dependencyPanel') dependencyPanel: any;
    @ViewChild('inputPanel') inputPanel: any;
    @ViewChild('recipeDialog') recipeDialog: any;

    jobTypes: any;
    columns: any[];
    dependencyOptions = [];
    inputJobs = [];
    nodes = [];
    links = [];
    height: number;
    showLegend = false;
    orientation: string; // LR, RL, TB, BT
    curve: any;
    selectedJobType: any;
    selectedNode: any;
    selectedNodeConnections = [];
    recipeDialogX: number;
    recipeDialogY: number;

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
                const jobType: JobType = _.find(this.recipeData.job_types, {
                    manifest: {
                        job: {
                            name: node.node_type.job_type_name,
                            jobVersion: node.node_type.job_type_version
                        }
                    }
                });
                this.nodes.push({
                    id: _.camelCase(node.node_type.job_type_name), // id can't have dashes or anything
                    label: `${jobType.manifest.job.title} v${jobType.manifest.job.jobVersion}`,
                    icon: String.fromCharCode(parseInt(jobType.icon_code, 16)),
                    dependencies: node.dependencies,
                    visible: true,
                    fillColor: node.instance ? this.colorService[node.instance.status] : this.colorService.RECIPE_NODE,
                    class: node.instance ? node.instance.status === 'RUNNING' ? 'throb-svg' : null : null,
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

    private getCurrJob() {
        return _.find(this.recipeData.definition.nodes, {
            node_type: {
                job_type_name: this.selectedNode.node_type.job_type_name,
                job_type_version: this.selectedNode.node_type.job_type_version
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
            this.selectedJobType = _.find(this.recipeData.job_types, {
                manifest: {
                    job: {
                        name: this.selectedNode.node_type.job_type_name,
                        jobVersion: this.selectedNode.node_type.job_type_version
                    }
                }
            });
            this.selectedNodeConnections = [];
            _.forEach(this.selectedNode.input, i => {
                if (i.node) {
                    const dependency = this.recipeData.definition.nodes[i.node];
                    const dependencyJobType: JobType = _.find(this.recipeData.job_types, {
                        manifest: {
                            job: {
                                name: dependency.node_type.job_type_name,
                                jobVersion: dependency.node_type.job_type_version
                            }
                        }
                    });
                    const connection: any = _.find(dependencyJobType.manifest.job.interface.outputs.files, {name: i.output});
                    this.selectedNodeConnections.push({
                        name: dependency.node_type.job_type_name,
                        output: connection.name
                    });
                }
            });
        }
    }

    getUnicode(code) {
        return `&#x${code};`;
    }

    showDependencyOptions(event) {
        this.dependencyOptions = [];
        // only show job types present in recipe
        _.forEach(this.recipeData.definition.nodes, node => {
            if (node.node_type.job_type_name !== this.selectedJobType.manifest.job.name) {
                const jobType: any = _.find(this.recipeData.job_types, {
                    manifest: {
                        job: {
                            name: node.node_type.job_type_name,
                            jobVersion: node.node_type.job_type_version
                        }
                    }
                });
                if (jobType) {
                    // only show job types that are not yet dependencies
                    jobType.disabled = _.find(this.selectedNode.dependencies, { name: jobType.manifest.job.name });
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
        const currJob: any = this.getCurrJob();
        if (currJob) {
            currJob.dependencies.push({
                connections: [],
                name: dependency.manifest.job.name
            });
            dependency.disabled = true;
            // manually call updateRecipe
            this.updateRecipe();
        } else {
            console.log('job not found');
        }
    }

    removeDependency(dependency) {
        const currJob: any = this.getCurrJob();
        if (currJob) {
            _.remove(currJob.dependencies, dependency);
            this.updateRecipe();
        } else {
            console.log('job not found');
        }
    }

    showInputConnections(event, input) {
        // inspect dependencies and display possible connections
        this.inputJobs = [];
        _.forEach(this.selectedNode.dependencies, dep => {
            const jobType: JobType = _.find(this.recipeData.job_types, {
                manifest: {
                    job: {
                        name: dep.name
                    }
                }
            });
            const job = {
                title: jobType.manifest.job.title,
                name: jobType.manifest.job.name,
                version: jobType.manifest.job.jobVersion,
                options: []
            };
            _.forEach(jobType.manifest.job.interface.outputs.files, output => {
                // only show the option if the output media type is contained in the input media types
                if (_.includes(input.mediaTypes, output.mediaType)) {
                    // disable the output if it currently exists as a connection
                    const hasOutput = _.find(_.values(this.selectedNode.input), { node: jobType.manifest.job.name, output: output.name });
                    output.disabled = !!hasOutput;
                    job.options.push(output);
                }
            });
            if (job.options.length > 0) {
                this.inputJobs.push(job);
            }
        });
        this.inputPanel.toggle(event);
    }

    addInputConnection(providerName, providerVersion, providerOutput) {
        if (providerOutput.disabled) {
            return;
        }
        const currJob: any = this.getCurrJob();
        if (currJob) {
            // look for the current job input that matches the dependency's output
            const currJobType: JobType = _.find(this.recipeData.job_types, {
                manifest: {
                    job: {
                        name: currJob.node_type.job_type_name,
                        jobVersion: currJob.node_type.job_type_version
                    }
                }
            });
            if (currJobType) {
                const currInput: any = _.find(currJobType.manifest.job.interface.inputs.files, file => {
                    return _.includes(file.mediaTypes, providerOutput.mediaType);
                });
                if (currInput) {
                    // matching input exists, so add the connection
                    this.selectedNodeConnections.push({
                        name: providerName,
                        output: providerOutput.name
                    });
                    currJob.input[currInput.name] = {
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
                console.log('job type not found');
            }
        } else {
            console.log('job not found');
        }
    }

    removeInputConnection(conn) {
        const currJob: any = this.getCurrJob();
        if (currJob) {
            const currInput = _.findKey(currJob.input, { node: conn.name, output: conn.output });
            if (currInput) {
                // remove input
                _.remove(this.selectedNodeConnections, { name: conn.name, output: conn.output });
                currJob.input[currInput] = {};
            } else {
                console.log('input not found');
            }
        } else {
            console.log('job not found');
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
