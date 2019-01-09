import * as _ from 'lodash';
import { ColorService } from '../../common/services/color.service';

export class NodeStatus {
    stateClass: string;
    errorTooltip: string;
    warningTooltip: string;
    jobExeData: any;
    runningJobData: any;
    colorService: ColorService;
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
        this.colorService = new ColorService();
        this.stateClass = `label-${this.state.name.toLowerCase()}`;
        this.errorTooltip = this.errors.length === 1 ? this.errors[0].description : this.errors.length + ' Errors';
        this.warningTooltip = this.warnings.length === 1 ? this.warnings[0].description : this.warnings.length + ' Warnings';
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
                            this.colorService.ERROR_SYSTEM,
                            this.colorService.ERROR_ALGORITHM,
                            this.colorService.ERROR_DATA,
                            this.colorService.SCALE_BLUE2
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
                    label: 'Job Count'
                }
            ]
        };
    }
}
