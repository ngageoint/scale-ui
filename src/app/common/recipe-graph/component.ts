import { Component, Input, OnChanges, OnInit } from '@angular/core';
import * as shape from 'd3-shape';
import * as _ from 'lodash';

import { ColorService } from '../../color.service';

@Component({
    selector: 'app-recipe-graph',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class RecipeGraphComponent implements OnInit, OnChanges {
    @Input() recipeData: any;

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

                if (this.recipeData.definition) {
                    _.forEach(this.recipeData.definition.jobs, (job) => {
                        // find dependents
                        const jobType = _.find(this.recipeData.job_types, { name: job.job_type.name, version: job.job_type.version });
                        if (jobType && jobType.job_type_interface) {
                            _.forEach(jobType.job_type_interface.output_data, (jobOutput) => {
                                if (jobOutput) {
                                    jobOutput.dependents = this.getDependents(job.name, jobOutput.name);
                                }
                            });
                            // add dependency mappings
                            _.forEach(jobType.job_type_interface.input_data, (jobInput) => {
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
        }
    }

    ngOnChanges() {
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
        }
    }

    ngOnInit() {
    }
}
