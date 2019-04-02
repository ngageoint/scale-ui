import * as _ from 'lodash';

import { ColorService } from '../../common/services/color.service';
import { DataService } from '../../common/services/data.service';

export class NodeStatus {
    stateClass: string;
    errorTooltip: string;
    warningTooltip: string;
    jobExeData: any;
    runningJobData: any;
    memArr: any;
    memFields: any;
    memTotal: any;
    gpusArr: any;
    gpusFields: any;
    gpusTotal: any;
    diskArr: any;
    diskFields: any;
    diskTotal: any;
    cpusArr: any;
    cpusFields: any;
    cpusTotal: any;
    errorData: any = [];
    warningData: any = [];
    private static build(data, job_types) {
        if (data) {
            return new NodeStatus(
                data.id,
                data.hostname,
                data.agent_id,
                data.is_active,
                data.state,
                data.errors,
                data.warnings,
                data.node_tasks,
                data.system_tasks,
                data.num_offers,
                data.resources,
                data.job_executions,
                job_types
            );
        }
    }
    public static transformer(data, job_types) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => NodeStatus.build(item, job_types));
            }
            return NodeStatus.build(data, job_types);
        }
        return null;
    }
    constructor(
        public id: number,
        public hostname: string,
        public agent_id: string,
        public is_active: boolean,
        public state: any,
        public errors: any,
        public warnings: any,
        public node_tasks: any,
        public system_tasks: any,
        public num_offers: number,
        public resources: any,
        public job_executions: any,
        public job_types: any
    ) {
        this.stateClass = `label-${this.state.name.toLowerCase()}`;
        this.errorTooltip = this.errors ?
            this.errors.length === 1 ? this.errors.length + ' Error' : this.errors.length + ' Errors' :
            null;
        this.warningTooltip = this.warnings ?
            this.warnings.length === 1 ? this.warnings.length + ' Warning' : this.warnings.length + ' Warnings' :
            null;
        if (!this.job_executions.failed.system.total &&
            !this.job_executions.failed.algorithm.total &&
            !this.job_executions.failed.data.total &&
            !this.job_executions.completed.total) {
            this.jobExeData = null;
        } else {
            this.jobExeData = {
                labels: ['SYS', 'ALG', 'DATA', 'COMP'],
                datasets: [
                    {
                        data: [
                            this.job_executions.failed.system.total,
                            this.job_executions.failed.algorithm.total,
                            this.job_executions.failed.data.total,
                            this.job_executions.completed.total
                        ],
                        backgroundColor: [
                            ColorService.ERROR_SYSTEM,
                            ColorService.ERROR_ALGORITHM,
                            ColorService.ERROR_DATA,
                            ColorService.COMPLETED
                        ],
                        label: 'Total'
                    }
                ]
            };
        }
        const labels = [];
        _.forEach(this.job_executions.running.by_job_type, jt => {
            const jobType: any = _.find(this.job_types, { id: jt.job_type_id });
            if (jobType) {
                labels.push(jobType.title);
            }
        });
        this.runningJobData = {
            labels: labels,
            datasets: [
                {
                    data: _.map(this.job_executions.running.by_job_type, 'count'),
                    backgroundColor: [
                        '#a6cee3',
                        '#1f78b4',
                        '#b2df8a',
                        '#33a02c',
                        '#fb9a99',
                        '#e31a1c',
                        '#fdbf6f',
                        '#ff7f00',
                        '#cab2d6',
                        '#6a3d9a',
                        '#ffff99',
                        '#b15928'
                    ],
                    label: 'Job Count'
                }
            ]
        };
        const calculateResource = (resource, isMib) => {
            if (this.resources && this.resources[resource].total > 0) {
                const offeredPercentage = (this.resources[resource].offered / this.resources[resource].total) * 100;
                const runningPercentage = (this.resources[resource].running / this.resources[resource].total) * 100;
                const freePercentage = (this.resources[resource].free / this.resources[resource].total) * 100;
                const unavailablePercentage = (this.resources[resource].unavailable / this.resources[resource].total) * 100;
                const resourcesArr = _.filter([
                    {key: 'offered', percentage: offeredPercentage, value: 0, field: 'offered'},
                    {key: 'running', percentage: runningPercentage, value: 0, field: 'running'},
                    {key: 'free', percentage: freePercentage, value: 0, field: 'free'},
                    {key: 'unavailable', percentage: unavailablePercentage, value: 0, field: 'unavailable'}
                ], d => d.percentage > 0);
                const resourcesFields = {
                    offered: isMib ?
                        DataService.calculateFileSizeFromMib(this.resources[resource].offered) :
                        this.resources[resource].offered,
                    running: isMib ?
                        DataService.calculateFileSizeFromMib(this.resources[resource].running) :
                        this.resources[resource].running,
                    free: isMib ?
                        DataService.calculateFileSizeFromMib(this.resources[resource].free) :
                        this.resources[resource].free,
                    unavailable: isMib ?
                        DataService.calculateFileSizeFromMib(this.resources[resource].unavailable) :
                        this.resources[resource].unavailable
                };
                return {
                    arr: resourcesArr,
                    fields: resourcesFields
                };
            }
            return false;
        };
        const memData = calculateResource('mem', true);
        const gpuData = calculateResource('gpus', false);
        const diskData = calculateResource('disk', true);
        const cpuData = calculateResource('cpus', false);
        this.memArr = memData ? memData.arr : null;
        this.memFields = memData ? memData.fields : null;
        this.memTotal = this.resources ? DataService.calculateFileSizeFromMib(this.resources.mem.total) : 0;
        this.gpusArr = gpuData ? gpuData.arr : null;
        this.gpusFields = gpuData ? gpuData.fields : null;
        this.gpusTotal = this.resources ? this.resources.gpus.total : 0;
        this.diskArr = diskData ? diskData.arr : null;
        this.diskFields = diskData ? diskData.fields : null;
        this.diskTotal = this.resources ? DataService.calculateFileSizeFromMib(this.resources.disk.total) : 0;
        this.cpusArr = cpuData ? cpuData.arr : null;
        this.cpusFields = cpuData ? cpuData.fields : null;
        this.cpusTotal = this.resources ? this.resources.cpus.total : 0;
        _.forEach(this.errors, error => {
            this.errorData.push({
                title: error.title,
                description: error.description,
                lastUpdatedDisplay: DataService.formatDate(error.last_updated, true),
                lastUpdatedTooltip: DataService.formatDate(error.last_updated)
            });
        });
        _.forEach(this.warnings, warning => {
            this.warningData.push({
                title: warning.title,
                description: warning.description,
                lastUpdatedDisplay: DataService.formatDate(warning.last_updated, true),
                lastUpdatedTooltip: DataService.formatDate(warning.last_updated)
            });
        });
    }
}
