import { DataService } from '../../common/services/data.service';
import * as moment from 'moment';
import { environment } from '../../../environments/environment';

export class Batch {
    dataService: DataService;
    creation_progress: any;
    creation_progress_tooltip: any;
    created_formatted: string;
    last_modified_formatted: string;
    statusClass: string;
    createdTooltip: any;
    createdDisplay: any;
    lastModifiedTooltip: any;
    lastModifiedDisplay: any;
    jobs_data: any;
    jobs_data_tooltip: any;

    private static build(data) {
        if (data) {
            return new Batch(
                data.id,
                data.title,
                data.description,
                data.recipe_type,
                data.recipe_type_rev,
                data.event,
                data.is_superseded,
                data.root_batch,
                data.superseded_batch,
                data.is_creation_done,
                data.jobs_total,
                data.jobs_pending,
                data.jobs_blocked,
                data.jobs_queued,
                data.jobs_running,
                data.jobs_failed,
                data.jobs_completed,
                data.jobs_canceled,
                data.recipes_estimated,
                data.recipes_total,
                data.recipes_completed,
                data.created,
                data.superseded,
                data.last_modified,
                data.definition,
                data.configuration,
                data.job_metrics
            );
        }
        return new Batch();
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => Batch.build(item));
            }
            return Batch.build(data);
        }
        return Batch.build(null);
    }

    constructor(
        public id?: number,
        public title?: string,
        public description?: string,
        public recipe_type?: any,
        public recipe_type_rev?: any,
        public event?: any,
        public is_superseded?: boolean,
        public root_batch?: any,
        public superseded_batch?: any,
        public is_creation_done?: boolean,
        public jobs_total?: number,
        public jobs_pending?: number,
        public jobs_blocked?: number,
        public jobs_queued?: number,
        public jobs_running?: number,
        public jobs_failed?: number,
        public jobs_completed?: number,
        public jobs_canceled?: number,
        public recipes_estimated?: number,
        public recipes_total?: number,
        public recipes_completed?: number,
        public created?: string,
        public superseded?: string,
        public last_modified?: string,
        public definition?: any,
        public configuration?: any,
        public job_metrics?: any
    ) {
        this.dataService = new DataService();
        if (this.created) {
            this.created_formatted = moment.utc(this.created).format(environment.dateFormat);
            this.createdTooltip = this.dataService.formatDate(this.created);
            this.createdDisplay = this.dataService.formatDate(this.created, true);
        }
        if (this.last_modified) {
            this.last_modified_formatted = moment.utc(this.last_modified).format(environment.dateFormat);
            this.lastModifiedTooltip = this.dataService.formatDate(this.last_modified);
            this.lastModifiedDisplay = this.dataService.formatDate(this.last_modified, true);
        }
        this.creation_progress = this.is_creation_done ?
            (this.recipes_completed / this.recipes_total) * 100 :
            (this.recipes_total / this.recipes_estimated) * 100;
        this.creation_progress_tooltip = this.is_creation_done ?
            `Completed: ${this.recipes_completed}, Total: ${this.recipes_total}` :
            `Total: ${this.recipes_total}, Estimated: ${this.recipes_estimated}`;
        this.id = this.id || null;
        this.title = this.title || null;
        this.description = this.description || null;
        this.recipe_type = this.recipe_type || null;
        this.recipe_type_rev = this.recipe_type_rev || null;
        this.event = this.event || null;
        this.is_superseded = this.is_superseded || null;
        this.root_batch = this.root_batch || null;
        this.superseded_batch = this.superseded_batch || null;
        this.is_creation_done = this.is_creation_done || null;
        this.jobs_total = this.jobs_total || 0;
        this.jobs_pending = this.jobs_pending || 0;
        this.jobs_blocked = this.jobs_blocked || 0;
        this.jobs_queued = this.jobs_queued || 0;
        this.jobs_running = this.jobs_running || 0;
        this.jobs_failed = this.jobs_failed || 0;
        this.jobs_completed = this.jobs_completed || 0;
        this.jobs_canceled = this.jobs_canceled || 0;
        this.recipes_estimated = this.recipes_estimated || null;
        this.recipes_total = this.recipes_total || null;
        this.recipes_completed = this.recipes_completed || null;
        this.created = this.created || null;
        this.superseded = this.superseded || null;
        this.last_modified = this.last_modified || null;
        this.definition = this.definition || null;
        this.configuration = this.configuration || null;
        this.job_metrics = this.job_metrics || null;
        this.jobs_data = (this.jobs_completed / this.jobs_total) * 100;
        this.jobs_data_tooltip = `Blocked: ${this.jobs_blocked}<br />Queued: ${this.jobs_queued}<br />Running: ${this.jobs_running}<br />Failed: ${this.jobs_failed}<br />Canceled: ${this.jobs_canceled}<br />Completed: ${this.jobs_completed}<hr />Total: ${this.jobs_total}`; // tslint:disable-line:max-line-length
    }
}
