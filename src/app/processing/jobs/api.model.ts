import { DataService } from '../../common/services/data.service';
import * as moment from 'moment';
import { JobType } from '../../configuration/job-types/api.model';
import { JobExecution } from './execution.model';
import { environment } from '../../../environments/environment';

export class Job {
    dataService: DataService;
    created_formatted: string;
    last_modified_formatted: string;
    duration: string;
    timeout_formatted: string;
    statusClass: string;
    exeStatusClass: string;
    createdTooltip: any;
    createdDisplay: any;
    lastModifiedTooltip: any;
    lastModifiedDisplay: any;
    occurredTooltip: any;
    occurredDisplay: any;
    exeEndedTooltip: any;

    private static build(data) {
        if (data) {
            return new Job(
                data.id,
                JobType.transformer(data.job_type),
                data.job_type_rev,
                data.event,
                data.node,
                data.error,
                data.status,
                data.priority,
                data.num_exes,
                data.timeout,
                data.max_tries,
                data.input_file_size,
                data.is_superseded,
                data.root_superseded_job,
                data.superseded_job,
                data.superseded_by_job,
                data.delete_superseded,
                data.created,
                data.queued,
                data.started,
                data.ended,
                data.last_status_change,
                data.superseded,
                data.last_modified,
                data.input,
                data.output,
                data.resources,
                JobExecution.transformer(data.execution),
                data.recipe,
                data.inputs,
                data.outputs
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => Job.build(item));
            }
            return Job.build(data);
        }
        return null;
    }

    constructor(
        public id: number,
        public job_type: any,
        public job_type_rev: object,
        public event: any,
        public node: any,
        public error: any,
        public status: string,
        public priority: number,
        public num_exes: number,
        public timeout: number,
        public max_tries: number,
        public input_file_size: number,
        public is_superseded: boolean,
        public root_superseded_job: object,
        public superseded_job: Job,
        public superseded_by_job: object,
        public delete_superseded: boolean,
        public created: string,
        public queued: string,
        public started: string,
        public ended: string,
        public last_status_change: string,
        public superseded: string,
        public last_modified: string,
        public input: object,
        public output: object,
        public resources: any,
        public execution: any,
        public recipe: any,
        public inputs: any,
        public outputs: any
    ) {
        this.dataService = new DataService();
        this.created_formatted = moment.utc(this.created).format(environment.dateFormat);
        this.last_modified_formatted = moment.utc(this.last_modified).format(environment.dateFormat);
        this.duration = this.started && this.ended ?
            this.dataService.calculateDuration(this.started, this.ended) :
            null;
        this.timeout_formatted = this.timeout ?
            this.dataService.calculateDuration(moment.utc().toISOString(), moment.utc().add(this.timeout, 's').toISOString()) :
            'Unknown';
        this.statusClass = this.status === 'RUNNING' ?
            `${this.status.toLowerCase()} throb-text` :
            this.status.toLowerCase();
        if (this.execution) {
            this.exeStatusClass = this.execution.status === 'RUNNING' ?
                `${this.execution.status.toLowerCase()} throb-text` :
                this.execution.status.toLowerCase();
        }
        this.createdTooltip = this.dataService.formatDate(this.created);
        this.createdDisplay = this.dataService.formatDate(this.created, true);
        this.lastModifiedTooltip = this.dataService.formatDate(this.last_modified);
        this.lastModifiedDisplay = this.dataService.formatDate(this.last_modified, true);
        this.occurredTooltip = this.dataService.formatDate(this.event.occurred);
        this.occurredDisplay = this.dataService.formatDate(this.event.occurred, true);
        this.exeEndedTooltip = this.execution ? this.dataService.formatDate(this.execution.ended) : null;
    }
}
