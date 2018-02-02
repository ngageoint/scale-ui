import { Component, Input, OnChanges, OnInit } from '@angular/core';
import * as shape from 'd3-shape';
import * as _ from 'lodash';

import { ColorService } from '../../color.service';
import { DataService } from '../../data.service';

@Component({
    selector: 'app-recipe-graph',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class RecipeGraphComponent implements OnInit, OnChanges {
    @Input() recipeData: any;
    @Input() isEditing: boolean;

    scrollHeight: number;
    sidebarDisplay: boolean;
    sidebarTitle: string;
    options: any;
    nodes = [];
    links = [];
    height: number;
    showLegend = false;
    orientation: string; // LR, RL, TB, BT
    curve: any;
    selectedJobType: any;
    selectedNode: any;

    constructor(
        private colorService: ColorService,
        private dataService: DataService
    ) {
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

    private updateRecipeDefinition() {
        if (this.recipeData.definition) {
            _.forEach(this.recipeData.definition.jobs, (job) => {
                // find dependents
                const jobType = _.find(this.recipeData.job_types, { name: job.job_type.name, version: job.job_type.version });
                if (jobType && jobType.manifest) {
                    _.forEach(jobType.manifest.output_data, (jobOutput) => {
                        if (jobOutput) {
                            jobOutput.dependents = this.getDependents(job.name, jobOutput.name);
                        }
                    });
                    // add dependency mappings
                    _.forEach(jobType.manifest.input_data, (jobInput) => {
                        if (jobInput) {
                            const inputMappings = [];
                            _.forEach(job.dependencies, (dependency) => {
                                _.forEach(dependency.connections, (conn) => {
                                    if (conn.input === jobInput.name) {
                                        inputMappings.push({
                                            name: dependency.name,
                                            output: conn.output,
                                            input: conn.input
                                        });
                                    }
                                });
                            });
                            _.forEach(job.recipe_inputs, (recipeInput) => {
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
                const jobType = _.find(this.recipeData.job_types, { name: job.job_type.name, version: job.job_type.version });
                this.nodes.push({
                    id: _.camelCase(job.name), // id can't have dashes or anything
                    label: jobType.name + ' v' + jobType.version,
                    name: job.name,
                    job_type: jobType,
                    icon: String.fromCharCode(parseInt(jobType.icon_code, 16)),
                    dependencies: job.dependencies,
                    visible: true,
                    fillColor: job.instance ? this.colorService[job.instance.status] : this.colorService.RECIPE_NODE
                });
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
            this.updateRecipeDefinition();
        }
    }

    select(e) {
        if (this.selectedNode) {
            this.selectedNode.options.stroke = '';
            this.selectedNode = null;
        }
        if (e.job_type) {
            if (this.selectedJobType &&
                    e.job_type.name === this.selectedJobType.name &&
                    e.job_type.version === this.selectedJobType.version) {
                this.selectedJobType = null;
            } else {
                this.selectedNode = e;
                this.selectedNode.options.stroke = this.colorService.SCALE_BLUE1;
                this.selectedJobType = _.find(this.recipeData.job_types, { name: e.job_type.name, version: e.job_type.version });
            }
        }
    }

    getUnicode(code) {
        return `&#x${code};`;
    }

    addDependency() {
        // only show job types present in recipe
        this.options = _.filter(this.recipeData.job_types, jobType => {
            return jobType.id !== this.selectedJobType.id;
        });
        // only show job types that are not yet dependencies
        this.options = _.filter(this.options, option => {
            return !_.find(this.selectedNode.dependencies, { name: option.name });
        });
        this.sidebarTitle = 'Add Dependency';
        this.sidebarDisplay = true;
    }

    removeDependency(dependency) {
        const currJob = _.find(this.recipeData.definition.jobs, {
            job_type: { name: this.selectedNode.job_type.name, version: this.selectedNode.job_type.version
        }});
        if (currJob) {
            _.remove(currJob.dependencies, dependency);
            this.updateRecipe();
        } else {
            console.log('job not found');
        }
    }

    removeInputConnection(conn) {
        const currJob = _.find(this.recipeData.definition.jobs, {
            job_type: { name: this.selectedNode.job_type.name, version: this.selectedNode.job_type.version
        }});
        if (currJob) {
            const currDependency = _.find(currJob.dependencies, { name: conn.name });
            const currConn = _.find(currDependency.connections, { output: conn.output });
            _.remove(currDependency.connections, currConn);
            this.updateRecipeDefinition();
            // console.log(currDependency.connections);
            // _.remove(currDependency.connections, conn);
        } else {
            console.log('job not found');
        }
    }

    optionClick(option) {
        const currJob = _.find(this.recipeData.definition.jobs, {
            job_type: { name: this.selectedNode.job_type.name, version: this.selectedNode.job_type.version
        }});
        if (currJob) {
            currJob.dependencies.push({
                connections: [],
                name: option.name
            });
            // manually call updateRecipe
            this.updateRecipe();
        } else {
            console.log('job not found');
        }
        this.sidebarDisplay = false;
    }

    ngOnChanges(changes) {
        if (changes.recipeData) {
            this.selectedJobType = null;
            this.selectedNode = null;
            this.updateRecipe();
        }
    }

    ngOnInit() {
        this.scrollHeight = this.dataService.getViewportSize().height * 0.85;
    }
}
