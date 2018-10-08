import {Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import * as shape from 'd3-shape';
import * as _ from 'lodash';

import { ColorService } from '../../services/color.service';
import { JobTypesApiService } from '../../../configuration/job-types/api.service';

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
    @ViewChild('outputPanel') outputPanel: any;

    jobTypes: any;
    columns: any[];
    dependencyOptions = [];
    inputJobs = [];
    outputJobs = [];
    nodes = [];
    links = [];
    height: number;
    showLegend = false;
    orientation: string; // LR, RL, TB, BT
    curve: any;
    selectedJobType: any;
    selectedNode: any;
    selectedNodeConnections: any;

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

    // private getDependents(name, outputName) {
    //     const results = [];
    //
    //     _.forEach(this.recipeData.definition.jobs, (job) => {
    //         if (job.name !== name) {
    //             _.forEach(job.dependencies, (dependency) => {
    //                 if (dependency.name === name) {
    //                     _.forEach(dependency.connections, (conn) => {
    //                         if (conn.output === outputName) {
    //                             results.push({
    //                                 name: job.name,
    //                                 output: conn.output,
    //                                 input: conn.input
    //                             });
    //                         }
    //                     });
    //                 }
    //             });
    //         }
    //     });
    //     return results;
    // }

    // private getIoMappings() {
    //     if (this.recipeData.definition) {
    //         _.forEach(this.recipeData.definition.nodes, node => {
    //             _.forEach(jobType.manifest.job.interface.outputs, jobOutput => {
    //                 if (jobOutput) {
    //                     jobOutput.dependents = this.getDependents(node.node_type.job_type_name, jobOutput.name);
    //                 }
    //             });
    //             // add dependency mappings
    //             _.forEach(jobType.manifest.job.interface.inputs, jobInput => {
    //                 if (jobInput) {
    //                     const inputMappings = [];
    //                     _.forEach(node.dependencies, dependency => {
    //                         _.forEach(dependency.connections, conn => {
    //                             if (conn.input === jobInput.name) {
    //                                 inputMappings.push({
    //                                     name: dependency.name,
    //                                     output: conn.output,
    //                                     input: conn.input
    //                                 });
    //                             }
    //                         });
    //                     });
    //                     _.forEach(node.recipe_inputs, recipeInput => {
    //                         if (recipeInput.job_input === jobInput.name) {
    //                             inputMappings.push({
    //                                 name: 'recipe',
    //                                 output: recipeInput.recipe_input,
    //                                 input: recipeInput.job_input
    //                             });
    //                         }
    //                     });
    //                     jobInput.dependencies = inputMappings;
    //                 }
    //             });
    //         });
    //     }
    // }

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
                const jobType = _.find(this.recipeData.job_types, {
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
            // this.getIoMappings();
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
                const dependency = this.recipeData.definition.nodes[i.node];
                const dependencyJobType = _.find(this.recipeData.job_types, {
                    manifest: {
                        job: {
                            name: dependency.node_type.job_type_name,
                            jobVersion: dependency.node_type.job_type_version
                        }
                    }
                });
                const connection = _.find(dependencyJobType.manifest.job.interface.outputs.files, { name: i.output });
                this.selectedNodeConnections.push({
                    name: dependency.node_type.job_type_name,
                    output: connection.name
                });
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
                const jobType = _.find(this.recipeData.job_types, {
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
        const currJob = this.getCurrJob();
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
        const currJob = this.getCurrJob();
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
            _.forEach(jobType.manifest.job.interface.outputs.files, output => {
                // only show the option if the output media type is contained in the input media types
                if (_.includes(input.mediaTypes, output.mediaType)) {
                    // disable the output if it currently exists as a connection
                    output.disabled = _.includes(
                        _.map(_.flatten(_.map(this.selectedNode.dependencies, 'connections')), 'output'),
                        output.name
                    );
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
                    if (currDependency) {
                        currDependency.connections.push(conn);

                        // set output as disabled to prevent duplicate mappings
                        providerOutput.disabled = true;
                        // this.getIoMappings();
                    }
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
        const currJob = this.getCurrJob();
        if (currJob) {
            const currDependency = _.find(currJob.dependencies, { name: conn.name });
            const currConn = _.find(currDependency.connections, { output: conn.output });
            _.remove(currDependency.connections, currConn);
            // this.getIoMappings();
        } else {
            console.log('job not found');
        }
    }

    // showOutputConnections(event, output) {
    //     // inspect dependents and display possible connections
    //     this.outputJobs = [];
    //     const dependentJobs = [];
    //     const nodes = _.values(this.recipeData.definition.nodes);
    //     _.forEach(nodes, node => {
    //         if (_.find(node.dependencies, { name: this.selectedNode.node_type.job_type_name })) {
    //             dependentJobs.push(node);
    //         }
    //     });
    //     _.forEach(dependentJobs, dep => {
    //         const jobType = _.find(this.recipeData.job_types, {
    //             manifest: {
    //                 job: {
    //                     name: dep.node_type.job_type_name,
    //                     jobVersion: dep.node_type.job_type_version
    //                 }
    //             }
    //         });
    //         const job = {
    //             title: jobType.manifest.job.title,
    //             name: jobType.manifest.job.name,
    //             version: jobType.manifest.job.jobVersion,
    //             options: []
    //         };
    //         _.forEach(jobType.manifest.job.interface.inputs.files, input => {
    //             // only show the option if the output media type is contained in the input media types
    //             if (_.includes(input.mediaTypes, output.mediaType)) {
    //                 // disable the input if it currently exists as a connection
    //                 const currDeps = _.map(this.selectedJobType.manifest.job.interface.outputs.files, 'dependents');
    //                 input.disabled = _.includes(_.map(_.flatten(currDeps), 'name'), job.name) &&
    //                     _.includes(_.map(_.flatten(_.map(dep.dependencies, 'connections')), 'input'), input.name);
    //                 job.options.push(input);
    //             }
    //         });
    //         if (job.options.length > 0) {
    //             this.outputJobs.push(job);
    //         }
    //     });
    //     this.outputPanel.toggle(event);
    // }
    //
    // addOutputConnection(providerName, providerVersion, providerOutput) {
    //     if (providerOutput.disabled) {
    //         return;
    //     }
    //     const currJob = this.getCurrJob();
    //     if (currJob) {
    //         const currJobType = _.find(this.recipeData.job_types, {
    //             manifest: {
    //                 job: {
    //                     name: currJob.job_type.name,
    //                     jobVersion: currJob.job_type.version
    //                 }
    //             }
    //         });
    //         const dependentJob = _.find(this.recipeData.definition.jobs, {
    //             job_type: {
    //                 name: providerName,
    //                 version: providerVersion
    //             }
    //         });
    //         if (dependentJob) {
    //             const currOutput = _.find(currJobType.manifest.job.interface.outputs, output => {
    //                 return _.includes(providerOutput.media_types, output.media_type);
    //             });
    //             if (currOutput) {
    //                 const conn = {
    //                     input: providerOutput.name,
    //                     output: currOutput.name
    //                 };
    //                 const currDependent = _.find(dependentJob.dependencies, { name: currJob.name });
    //                 if (currDependent) {
    //                     currDependent.connections.push(conn);
    //
    //                     // set output as disabled to prevent duplicate mappings
    //                     providerOutput.disabled = true;
    //                     // this.getIoMappings();
    //                 }
    //             } else {
    //                 console.log('compatible media type not found');
    //             }
    //         } else {
    //             console.log('dependent job not found');
    //         }
    //     } else {
    //         console.log('job not found');
    //     }
    // }
    //
    // removeOutputConnection(conn) {
    //     const currJob = this.getCurrJob();
    //     const dependentJob = _.find(this.recipeData.definition.jobs, { name: conn.name });
    //     if (dependentJob) {
    //         const currDependency = _.find(dependentJob.dependencies, { name: currJob.name });
    //         const currConn = _.find(currDependency.connections, { input: conn.input });
    //         _.remove(currDependency.connections, currConn);
    //         // this.getIoMappings();
    //     } else {
    //         console.log('job not found');
    //     }
    // }

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
