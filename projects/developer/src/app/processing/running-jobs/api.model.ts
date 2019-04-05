import * as moment from 'moment';

import { JobType } from '../../configuration/job-types/api.model';
import { DataService } from '../../common/services/data.service';

export class RunningJob {
    longest_running_duration: string;

    private static build(data) {
        if (data) {
            return new RunningJob(
                data.count,
                data.job_type,
                data.longest_running
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => RunningJob.build(item));
            }
            return RunningJob.build(data);
        }
        return null;
    }
    constructor(
        public count: number,
        public job_type: JobType,
        public longest_running: string
    ) {
        this.longest_running_duration = DataService.calculateDuration(this.longest_running, moment.utc().toISOString());
    }
}
