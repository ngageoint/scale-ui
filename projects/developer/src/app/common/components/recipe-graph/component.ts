import {Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import * as shape from 'd3-shape';
import * as _ from 'lodash';

import { ColorService } from '../../services/color.service';
import { DataService } from '../../services/data.service';

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
        private colorService: ColorService,
        private dataService: DataService
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
            this.updateRecipeDefinition();
        }
    }

    private getIoMappings() {
        if (this.recipeData.definition) {
            _.forEach(this.recipeData.definition.jobs, job => {
                // populate the current jobType
                /*var thisJobType = _.find($scope.recipeType.job_types,{id: job.job_type_id});
                 job.job_type = thisJobType;*/

                // find dependents
                if (job.job_type && job.job_type.job_type_interface) {
                    _.forEach(job.job_type.job_type_interface.output_data, jobOutput => {
                        if (jobOutput) {
                            jobOutput.dependents = this.getDependents(job.name, jobOutput.name);
                        }
                    });
                    // add dependency mappings
                    _.forEach(job.job_type.job_type_interface.input_data, jobInput => {
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

    checkType(data) {
        return typeof data;
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
            const job = {
                name: dep.name,
                options: []
            };
            _.forEach(dep.connections, conn => {
                job.options.push(conn.output);
            });
            this.ioJobs.push(job);
        });
        // const inputOptions = _.map(_.flatten(_.map(currJob.dependencies, 'connections')), 'output');
        // _.forEach(inputOptions, opt => {
        //     this.options.push(`${currJob.name}: ${opt}`);
        // });
        this.ioPanel.show(event);
    }

    // mapInput(providerName, providerOutput) {
    //     console.log('map selected job input to ' + providerName + '.' + providerOutput);
    //     var dependency = _.find(vm.selectedJob.dependencies, {name: providerName});
    //
    //     if (dependency && dependency.connections && dependency.connections.length > 0) {
    //         var conn = _.find(dependency.connections, { output: providerOutput, input: vm.selectedJobInput.name });
    //         if (!conn) {
    //             dependency.connections.push({ output: providerOutput, input: vm.selectedJobInput.name });
    //         }
    //     }
    //     else if (!dependency) {
    //         dependency = {name: providerName, connections: [{ output: providerOutput, input: vm.selectedJobInput.name }]};
    //         vm.selectedJob.dependencies.push(dependency);
    //     }
    //     else {
    //         dependency.connections = [{ output: providerOutput, input: vm.selectedJobInput.name }];
    //     }
    //     vm.selectedJob.depStart = false;
    //     vm.editMode = '';
    //     vm.selectedJobInput = null;
    //     vm.selectedInputProvider = null;
    //     enableSaveRecipe();
    //     vm.redraw();
    // }

    removeInputConnection(conn) {
        const currJob = this.getCurrJob();
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
        // this.getIoMappings();
    }
}
