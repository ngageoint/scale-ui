import { DataService } from '../../data.service';
import * as moment from 'moment';
import { JobType } from '../../configuration/job-types/api.model';
import { JobExecution } from './execution.model';

export class Job {
    dataService: DataService;
    created_formatted: string;
    last_modified_formatted: string;
    duration: string;
    timeout_formatted: string;

    private static build(data) {
        if (data) {
            return new Job(
                data.id,
                data.job_type,
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
                data.recipe
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
        public job_type: JobType,
        public job_type_rev: object,
        public event: any,
        public node: any,
        public error: object,
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
        public recipe: any
    ) {
        this.dataService = new DataService();
        this.created_formatted = moment.utc(this.created).format('YYYY-MM-DD HH:mm:ss');
        this.last_modified_formatted = moment.utc(this.last_modified).format('YYYY-MM-DD HH:mm:ss');
        this.duration = this.started && this.ended ?
            this.dataService.calculateDuration(this.started, this.ended) :
            null;
        this.timeout_formatted = this.timeout ?
            this.dataService.calculateDuration(moment.utc().toISOString(), moment.utc().add(this.timeout, 's').toISOString()) :
            'Unknown';
    }
}
