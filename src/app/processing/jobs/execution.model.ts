import { Job } from './api.model';
import * as moment from 'moment';

export class JobExecution {
    created_formatted: string;
    queued_formatted: string;
    started_formatted: string;
    ended_formatted: string;
    last_modified_formatted: string;

    private static build(data) {
        if (data) {
            return new JobExecution(
                data.id,
                data.status,
                data.command_arguments,
                data.timeout,
                data.pre_started,
                data.pre_completed,
                data.pre_exit_code,
                data.job_started,
                data.job_completed,
                data.job_exit_code,
                data.post_started,
                data.post_completed,
                data.post_exit_code,
                data.created,
                data.queued,
                data.started,
                data.ended,
                data.last_modified,
                data.job,
                data.node,
                data.error,
                data.environment,
                data.cpus_scheduled,
                data.mem_scheduled,
                data.disk_in_scheduled,
                data.disk_out_scheduled,
                data.disk_total_scheduled,
                data.results,
                data.results_manifest
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
        public command_arguments: string,
        public timeout: number,
        public pre_started: string,
        public pre_completed: string,
        public pre_exit_code: number,
        public job_started: string,
        public job_completed: string,
        public job_exit_code: number,
        public post_started: string,
        public post_completed: string,
        public post_exit_code: number,
        public created: string,
        public queued: string,
        public started: string,
        public ended: string,
        public last_modified: string,
        public job: Job,
        public node: any,
        public error: any,
        public environment: any,
        public cpus_scheduled: number,
        public mem_scheduled: number,
        public disk_in_scheduled: number,
        public disk_out_scheduled: number,
        public disk_total_scheduled: number,
        public results: any,
        public results_manifest: any
    ) {
        this.created_formatted = moment.utc(this.created).format('YYYY-MM-DD HH:mm:ss');
        this.queued_formatted = moment.utc(this.queued).format('YYYY-MM-DD HH:mm:ss');
        this.started_formatted = moment.utc(this.started).format('YYYY-MM-DD HH:mm:ss');
        this.ended_formatted = moment.utc(this.ended).format('YYYY-MM-DD HH:mm:ss');
        this.last_modified_formatted = moment.utc(this.last_modified_formatted).format('YYYY-MM-DD HH:mm:ss');
    }
}
