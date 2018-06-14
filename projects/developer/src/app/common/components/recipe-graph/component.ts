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
    @ViewChild('dependencyPanel') dependencyPanel: any;
    @ViewChild('ioPanel') ioPanel: any;

    columns: any[];
    dependencyOptions = [];
    ioJobs = [];
    nodes = [];
    links = [];
    height: number;
    showLegend = false;
    orientation: string; // LR, RL, TB, BT
    curve: any;
    selectedJobType: any;
    selectedNode: any;

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

    private getDependents(name, outputName) {
        const results = [];

        _.forEach(this.recipeData.definition.jobs, (job) => {
            if (job.name !== name) {
                _.forEach(job.dependencies, (dependency) => {
                    if (dependency.name === name) {
                        _.forEach(dependency.connections, (conn) => {
                            if (conn.output === outputName) {
                                results.push({
                                    name: job.name,
                                    output: conn.output,
                                    input: conn.input
                                });
                            }
                        });
                    }
                });
            }
        });
        return results;
    }

    private getIoMappings() {
        if (this.recipeData.definition) {
            _.forEach(this.recipeData.definition.jobs, job => {
                // find dependents
                const jobType = _.find(this.recipeData.job_types, {
                    manifest: {
                        job: {
                            name: job.job_type.name,
                            jobVersion: job.job_type.version
                        }
                    }
                });
                if (jobType) {
                    _.forEach(jobType.manifest.job.interface.outputs, jobOutput => {
                        if (jobOutput) {
                            jobOutput.dependents = this.getDependents(job.name, jobOutput.name);
                        }
                    });
                    // add dependency mappings
                    _.forEach(jobType.manifest.job.interface.inputs, jobInput => {
                        if (jobInput) {
                            const inputMappings = [];
                            _.forEach(job.dependencies, dependency => {
                                _.forEach(dependency.connections, conn => {
                                    if (conn.input === jobInput.name) {
                                        inputMappings.push({
                                            name: dependency.name,
                                            output: conn.output,
                                            input: conn.input
                                        });
                                    }
                                });
                            });
                            _.forEach(job.recipe_inputs, recipeInput => {
                                if (recipeInput.job_input === jobInput.name) {
                                    inputMappings.push({
                                        name: 'recipe',
                                        output: recipeInput.recipe_input,
                                        input: recipeInput.job_input
                                    });
                                }
                            });
                            jobInput.dependencies = inputMappings;
                        }
                    });

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
                job_type: null,
                icon: null,
                dependencies: [],
                visible: true,
                fillColor: this.colorService.RECIPE_NODE
            }];
            this.links = [];

            _.forEach(this.recipeData.definition.jobs, (job) => {
                const jobType = _.find(this.recipeData.job_types, {
                    manifest: {
                        job: {
                            name: job.job_type.name,
                            jobVersion: job.job_type.version
                        }
                    }
                });
                if (jobType) {
                    this.nodes.push({
                        id: _.camelCase(job.name), // id can't have dashes or anything
                        label: jobType.manifest.job.name + ' v' + jobType.manifest.job.jobVersion,
                        name: job.name,
                        job_type: jobType,
                        icon: String.fromCharCode(parseInt(jobType.icon_code, 16)),
                        dependencies: job.dependencies,
                        visible: true,
                        fillColor: job.instance ? this.colorService[job.instance.status] : this.colorService.RECIPE_NODE,
                        class: job.instance ? job.instance.status === 'RUNNING' ? 'throb-svg' : null : null
                    });
                }
            });

            _.forEach(this.nodes, (node) => {
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
                        _.forEach(node.dependencies, (dependency) => {
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
            this.getIoMappings();
        }
    }

    private getCurrJob() {
        return _.find(this.recipeData.definition.jobs, {
            job_type: {
                name: this.selectedNode.job_type.manifest.job.name,
                version: this.selectedNode.job_type.manifest.job.jobVersion
            }
        });
    }

    select(e) {
        if (this.selectedNode) {
            this.selectedNode.options.stroke = '';
            this.selectedNode = null;
        }
        if (e.job_type) {
            if (this.selectedJobType &&
                    e.job_type.manifest.job.name === this.selectedJobType.name &&
                    e.job_type.manifest.job.jobVersion === this.selectedJobType.version) {
                this.selectedJobType = null;
            } else {
                this.selectedNode = e;
                this.selectedNode.options.stroke = this.colorService.SCALE_BLUE1;
                this.selectedJobType = _.find(this.recipeData.job_types, {
                    manifest: {
                        job: {
                            name: e.job_type.manifest.job.name,
                            jobVersion: e.job_type.manifest.job.jobVersion
                        }
                    }
                });
            }
        }
    }

    getUnicode(code) {
        return `&#x${code};`;
    }

    addDependency(event) {
        // only show job types present in recipe
        this.dependencyOptions = _.filter(this.recipeData.job_types, jobType => {
            return jobType.id !== this.selectedJobType.id;
        });
        // only show job types that are not yet dependencies
        _.forEach(this.dependencyOptions, option => {
            option.disabled = _.find(this.selectedNode.dependencies, { name: option.manifest.job.name });
        });
        this.dependencyPanel.show(event);
    }

    removeDependency(dependency) {
        const currJob = this.getCurrJob();
        if (currJob) {
            _.remove(currJob.dependencies, dependency);
            this.updateRecipe();
        } else {
            console.log('job not found');
        }
    }

    addInput(event) {
        // inspect dependencies and display possible inputs
        this.ioJobs = [];
        const currJob = this.getCurrJob();
        _.forEach(currJob.dependencies, dep => {
            const jobType = _.find(this.recipeData.job_types, {
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
            _.forEach(jobType.manifest.job.interface.outputs, output => {
                // disable the output if it currently exists as a connection
                output.disabled = _.includes(_.map(_.flatten(_.map(currJob.dependencies, 'connections')), 'output'), output.name);
                job.options.push(output);
            });
            this.ioJobs.push(job);
        });
        this.ioPanel.show(event);
    }

    addInputConnection(providerName, providerVersion, providerOutput) {
        if (providerOutput.disabled) {
            return;
        }
        const currJob = this.getCurrJob();
        if (currJob) {
            // look for the current job input that matches the dependency's output
            const currJobType = _.find(this.recipeData.job_types, {
                manifest: {
                    job: {
                        name: currJob.job_type.name,
                        jobVersion: currJob.job_type.version
                    }
                }
            });
            if (currJobType) {
                const currInput = _.find(currJobType.manifest.job.interface.inputs, input => {
                    return _.includes(input.media_types, providerOutput.media_type);
                });
                if (currInput) {
                    // matching input exists, so add the connection
                    const conn = {
                        input: currInput.name,
                        output: providerOutput.name
                    };
                    const currDependency = _.find(currJob.dependencies, { name: providerName });
                    currDependency.connections.push(conn);

                    // set output as disabled to prevent duplicate mappings
                    providerOutput.disabled = true;
                    this.getIoMappings();
                } else {
                    console.log('no matching input found');
                }
            } else {
                console.log('job type not found');
            }
        } else {
            console.log('job not found');
        }
    }

    removeInputConnection(conn) {
        const currJob = this.getCurrJob();
        if (currJob) {
            const currDependency = _.find(currJob.dependencies, { name: conn.name });
            const currConn = _.find(currDependency.connections, { output: conn.output });
            _.remove(currDependency.connections, currConn);
            this.getIoMappings();
        } else {
            console.log('job not found');
        }
    }

    optionClick(option) {
        if (option.disabled) {
            return;
        }
        const currJob = this.getCurrJob();
        if (currJob) {
            currJob.dependencies.push({
                connections: [],
                name: option.manifest.job.name
            });
            option.disabled = true;
            // manually call updateRecipe
            this.updateRecipe();
        } else {
            console.log('job not found');
        }
    }

    ngOnChanges(changes) {
        if (changes.recipeData) {
            this.selectedJobType = null;
            this.selectedNode = null;
            this.updateRecipe();
        }
    }

    ngOnInit() {
    }
}
