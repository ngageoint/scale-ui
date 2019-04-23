import * as moment from 'moment';
import * as _ from 'lodash';

import { environment } from '../../../environments/environment';
import { DataService } from '../../common/services/data.service';
import { RecipeType } from '../../configuration/recipe-types/api.model';

export class Batch {
    creation_progress: any;
    creation_progress_tooltip: any;
    created_formatted: string;
    last_modified_formatted: string;
    statusClass: string;
    createdTooltip: any;
    createdDisplay: any;
    lastModifiedTooltip: any;
    lastModifiedDisplay: any;
    jobs_blocked_percentage: any;
    jobs_queued_percentage: any;
    jobs_running_percentage: any;
    jobs_failed_percentage: any;
    jobs_canceled_percentage: any;
    jobs_completed_percentage: any;
    jobsArr: any;
    jobsFields: any;
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
                data.job_metrics,
                data.selected
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

    public cleanBatch() {
        return {
            recipe_type_id: this.recipe_type.id,
            definition: this.definition,
            configuration: this.configuration
        };
    }

    public newBatch() {
        return {
            title: this.title,
            description: this.description,
            recipe_type_id: this.recipe_type.id,
            definition: this.definition,
            configuration: this.configuration
        };
    }

    public editBatch() {
        return {
            title: this.title,
            description: this.description,
            configuration: this.configuration
        };
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
        public job_metrics?: any,
        public selected?: boolean
    ) {
        if (this.created) {
            this.created_formatted = moment.utc(this.created).format(environment.dateFormat);
            this.createdTooltip = DataService.formatDate(this.created);
            this.createdDisplay = DataService.formatDate(this.created, true);
        }
        if (this.last_modified) {
            this.last_modified_formatted = moment.utc(this.last_modified).format(environment.dateFormat);
            this.lastModifiedTooltip = DataService.formatDate(this.last_modified);
            this.lastModifiedDisplay = DataService.formatDate(this.last_modified, true);
        }
        this.creation_progress = this.is_creation_done ?
            this.recipes_total > 0 ?
                (this.recipes_completed / this.recipes_total) * 100 :
                0 :
            this.recipes_estimated > 0 ?
                (this.recipes_total / this.recipes_estimated) * 100 :
                0;
        this.creation_progress_tooltip = this.is_creation_done ?
            `Completed: ${this.recipes_completed}, Total: ${this.recipes_total}` :
            `Total: ${this.recipes_total}, Estimated: ${this.recipes_estimated}`;
        this.id = this.id || null;
        this.title = this.title || null;
        this.description = this.description || null;
        this.recipe_type = this.recipe_type || null;
        this.recipe_type_rev = this.recipe_type_rev ? RecipeType.transformer(this.recipe_type_rev) : null;
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
        this.definition = this.definition || { previous_batch: { root_batch_id: null, forced_nodes: {} } };
        this.configuration = this.configuration || {priority: null};
        this.job_metrics = this.job_metrics || null;
        this.jobs_blocked_percentage = (this.jobs_blocked / this.jobs_total) * 100;
        this.jobs_queued_percentage = (this.jobs_queued / this.jobs_total) * 100;
        this.jobs_running_percentage = (this.jobs_running / this.jobs_total) * 100;
        this.jobs_failed_percentage = (this.jobs_failed / this.jobs_total) * 100;
        this.jobs_canceled_percentage = (this.jobs_canceled / this.jobs_total) * 100;
        this.jobs_completed_percentage = (this.jobs_completed / this.jobs_total) * 100;
        this.jobsArr = _.filter([
            { key: 'blocked', percentage: this.jobs_blocked_percentage, value: 0, field: 'jobs_blocked' },
            { key: 'queued', percentage: this.jobs_queued_percentage, value: 0, field: 'jobs_queued' },
            { key: 'running', percentage: this.jobs_running_percentage, value: 0, field: 'jobs_running' },
            { key: 'failed', percentage: this.jobs_failed_percentage, value: 0, field: 'jobs_failed' },
            { key: 'canceled', percentage: this.jobs_canceled_percentage, value: 0, field: 'jobs_canceled' },
            { key: 'completed', percentage: this.jobs_completed_percentage, value: 0, field: 'jobs_completed' }
        ], d => d.percentage > 0);
        this.jobsFields = {
            jobs_blocked: this.jobs_blocked,
            jobs_queued: this.jobs_queued,
            jobs_running: this.jobs_running,
            jobs_failed: this.jobs_failed,
            jobs_canceled: this.jobs_canceled,
            jobs_completed: this.jobs_completed
        };
    }
}
