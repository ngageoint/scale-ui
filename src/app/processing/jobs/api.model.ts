import { DataService } from '../../data.service';
import * as moment from 'moment';
import { JobType } from '../../configuration/job-types/api.model';
import { JobExecution } from './execution.model';

export class Job {
    dataService: DataService;
    created_formatted: string;
    last_modified_formatted: string;
    duration: string;

    private static build(data) {
        if (data) {
            return new Job(
                data.id,
                data.job_type,
                data.job_type_rev,
                data.event,
                data.error,
                data.status,
                data.priority,
                data.num_exes,
                data.timeout,
                data.max_tries,
                data.cpus_required,
                data.mem_required,
                data.disk_in_required,
                data.disk_out_required,
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
                data.data,
                data.results,
                data.recipes,
                JobExecution.transformer(data.job_exes),
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

    public getLatestExecution(): JobExecution {
        if (this.num_exes > 0 ) {
            return this.job_exes[0];
        }
        return null;
    }

    constructor(
        public id: number,
        public job_type: JobType,
        public job_type_rev: object,
        public event: object,
        public error: object,
        public status: string,
        public priority: number,
        public num_exes: number,
        public timeout: number,
        public max_tries: number,
        public cpus_required: number,
        public mem_required: number,
        public disk_in_required: number,
        public disk_out_required: number,
        public is_superseded: boolean,
        public root_superseded_job: object,
        public superseded_job: object,
        public superseded_by_job: object,
        public delete_superseded: boolean,
        public created: string,
        public queued: string,
        public started: string,
        public ended: string,
        public last_status_change: string,
        public superseded: string,
        public last_modified: string,
        public data: object,
        public results: object,
        public recipes: object[],
        public job_exes: any,
        public inputs: object[],
        public outputs: object[]
    ) {
        this.dataService = new DataService();
        this.created_formatted = moment.utc(this.created).format('YYYY-MM-DD HH:mm:ss');
        this.last_modified_formatted = moment.utc(this.last_modified).format('YYYY-MM-DD HH:mm:ss');
        this.duration = this.dataService.calculateDuration(this.started, this.ended);
    }
}
