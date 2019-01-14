import * as moment from 'moment';

import { JobType } from '../../configuration/job-types/api.model';
import { DataService } from '../../common/services/data.service';

export class QueuedJob {
    dataService: DataService;
    longest_queued_duration: string;

    private static build(data) {
        if (data) {
            return new QueuedJob(
                data.job_type,
                data.count,
                data.longest_queued,
                data.highest_priority
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => QueuedJob.build(item));
            }
            return QueuedJob.build(data);
        }
        return null;
    }
    constructor(
        public job_type: JobType,
        public count: number,
        public longest_queued: string,
        public highest_priority: number
    ) {
        this.dataService = new DataService();
        this.longest_queued_duration = this.dataService.calculateDuration(this.longest_queued, moment.utc().toISOString());
    }
}
