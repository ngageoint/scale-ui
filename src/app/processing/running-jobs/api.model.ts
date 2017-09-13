import { JobType } from '../../configuration/job-types/api.model';

export class RunningJob {
    constructor(
        public count: number,
        public job_type: JobType,
        public longest_running: string,
        public longest_running_duration: string
    ) {}
}
