import { ColorService } from '../services/color.service';

export class NodeStatus {
    stateClass: string;
    errorTooltip: string;
    warningTooltip: string;
    jobExeData: any;
    colorService: ColorService;
    private static build(data) {
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
                data.job_executions
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => NodeStatus.build(item));
            }
            return NodeStatus.build(data);
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
        public job_executions: any
    ) {
        this.colorService = new ColorService();
        this.stateClass = `label-${this.state.name.toLowerCase()}`;
        this.errorTooltip = this.errors.length === 1 ? this.errors[0].description : this.errors.length + ' Errors';
        this.warningTooltip = this.warnings.length === 1 ? this.warnings[0].description : this.warnings.length + ' Warnings';
        this.jobExeData = {
            labels: ['System', 'Algorithm', 'Data', 'Completed'],
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
                    label: 'Job Executions'
                }
            ]
        };
    }
}
