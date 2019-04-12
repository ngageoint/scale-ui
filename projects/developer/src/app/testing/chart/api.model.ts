import * as moment from 'moment';
import * as _ from 'lodash';

import { environment } from '../../../environments/environment';
import { DataService } from '../../common/services/data.service';
import { JobType } from '../../configuration/job-types/api.model';
import { JobExecution } from './execution.model';

export class Job {
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
    inputJson: any;
    outputJson: any;

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
                data.resources,
                JobExecution.transformer(data.execution),
                data.recipe,
                data.input,
                data.output,
                data.selected
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
        public resources: any,
        public execution: any,
        public recipe: any,
        public input: any,
        public output: any,
        public selected: boolean
    ) {
        this.created_formatted = moment.utc(this.created).format(environment.dateFormat);
        this.last_modified_formatted = moment.utc(this.last_modified).format(environment.dateFormat);
        this.duration = this.started && this.ended ?
            DataService.calculateDuration(this.started, this.ended) :
            null;
        this.timeout_formatted = this.timeout ?
            DataService.calculateDuration(moment.utc().toISOString(), moment.utc().add(this.timeout, 's').toISOString()) :
            'Unknown';
        this.statusClass = this.status === 'RUNNING' ?
            `${this.status.toLowerCase()}-text throb-text` :
            `${this.status.toLowerCase()}-text`;
        if (this.execution) {
            this.exeStatusClass = this.execution.status === 'RUNNING' ?
                `${this.execution.status.toLowerCase()}-text throb-text` :
                `${this.execution.status.toLowerCase()}-text`;
        }
        this.createdTooltip = DataService.formatDate(this.created);
        this.createdDisplay = DataService.formatDate(this.created, true);
        this.lastModifiedTooltip = DataService.formatDate(this.last_modified);
        this.lastModifiedDisplay = DataService.formatDate(this.last_modified, true);
        this.occurredTooltip = this.event ? DataService.formatDate(this.event.occurred) : null;
        this.occurredDisplay = this.event ? DataService.formatDate(this.event.occurred, true) : null;
        this.exeEndedTooltip = this.execution ? DataService.formatDate(this.execution.ended) : null;
        this.inputJson = this.input ? _.keys(this.input.json).length > 0 ? JSON.stringify(this.input.json, null, 2) : null : null;
        this.outputJson = this.output ? _.keys(this.output.json).length > 0 ? JSON.stringify(this.output.json, null, 2) : null : null;
    }
}
