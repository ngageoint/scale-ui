import { environment } from '../../../environments/environment';
import { Job } from './api.model';
import { JobType } from '../../configuration/job-types/api.model';
import * as moment from 'moment';

export class JobExecution {
    created_formatted: string;
    queued_formatted: string;
    started_formatted: string;
    ended_formatted: string;
    last_modified_formatted: string;
    statusClass: string;

    private static build(data) {
        if (data) {
            return new JobExecution(
                data.id,
                data.status,
                data.exe_num,
                data.cluster_id,
                data.created,
                data.queued,
                data.started,
                data.ended,
                data.last_modified,
                data.job,
                data.node,
                data.error,
                data.job_type,
                data.timeout,
                data.input_file_size,
                data.task_results,
                data.resources,
                data.configuration,
                data.output
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => JobExecution.build(item));
            }
            return JobExecution.build(data);
        }
        return null;
    }

    constructor(
        public id: number,
        public status: string,
        public exe_num: any,
        public cluster_id: any,
        public created: string,
        public queued: string,
        public started: string,
        public ended: string,
        public last_modified: string,
        public job: Job,
        public node: any,
        public error: any,
        public job_type: JobType,
        public timeout: any,
        public input_file_size: any,
        public task_results: any,
        public resources: any,
        public configuration: any,
        public output: any
    ) {
        this.created_formatted = moment.utc(this.created).format(environment.dateFormat);
        this.queued_formatted = moment.utc(this.queued).format(environment.dateFormat);
        this.started_formatted = moment.utc(this.started).format(environment.dateFormat);
        this.ended_formatted = moment.utc(this.ended).format(environment.dateFormat);
        this.last_modified_formatted = moment.utc(this.last_modified_formatted).format(environment.dateFormat);
        this.statusClass = this.status === 'RUNNING' ?
            `${this.status.toLowerCase()}-text throb-text` :
            `${this.status.toLowerCase()}-text`;
    }
}
