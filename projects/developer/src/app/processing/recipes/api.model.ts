import * as _ from 'lodash';

import { DataService } from '../../common/services/data.service';

export class Recipe {
    dataService: DataService;
    createdDisplay: string;
    createdTooltip: string;
    completedDisplay: string;
    completedTooltip: string;
    supersededDisplay: string;
    supersededTooltip: string;
    lastModifiedDisplay: string;
    lastModifiedTooltip: string;
    duration: string;
    jobMetrics: any;
    jobs_pending_percentage: any;
    jobs_blocked_percentage: any;
    jobs_queued_percentage: any;
    jobs_running_percentage: any;
    jobs_failed_percentage: any;
    jobs_completed_percentage: any;
    jobs_canceled_percentage: any;
    jobsArr: any;
    jobsFields: any;

    private static build(data) {
        if (data) {
            return new Recipe(
                data.id,
                data.recipe_type,
                data.recipe_type_rev,
                data.event,
                data.batch,
                data.recipe,
                data.is_superseded,
                data.superseded_recipe,
                data.input_file_size,
                data.source_started,
                data.source_ended,
                data.source_sensor_class,
                data.source_sensor,
                data.source_collection,
                data.source_task,
                data.jobs_total,
                data.jobs_pending,
                data.jobs_blocked,
                data.jobs_queued,
                data.jobs_running,
                data.jobs_failed,
                data.jobs_completed,
                data.jobs_canceled,
                data.sub_recipes_total,
                data.sub_recipes_completed,
                data.is_completed,
                data.created,
                data.completed,
                data.superseded,
                data.last_modified,
                data.superseded_by_recipe,
                data.input,
                data.details,
                data.job_types,
                data.sub_recipe_types
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => Recipe.build(item));
            }
            return Recipe.build(data);
        }
        return null;
    }
    constructor(
        public id: number,
        public recipe_type: object,
        public recipe_type_rev: object,
        public event: object,
        public batch: any,
        public recipe: any,
        public is_superseded: boolean,
        public superseded_recipe: object,
        public input_file_size: number,
        public source_started: string,
        public source_ended: string,
        public source_sensor_class: string,
        public source_sensor: string,
        public source_collection: string,
        public source_task: string,
        public jobs_total: number,
        public jobs_pending: number,
        public jobs_blocked: number,
        public jobs_queued: number,
        public jobs_running: number,
        public jobs_failed: number,
        public jobs_completed: number,
        public jobs_canceled: number,
        public sub_recipes_total: number,
        public sub_recipes_completed: number,
        public is_completed: boolean,
        public created: string,
        public completed: string,
        public superseded: string,
        public last_modified: string,
        public superseded_by_recipe: any,
        public input: any,
        public details: any,
        public job_types: any,
        public sub_recipe_types: any
    ) {
        this.createdDisplay = DataService.formatDate(this.created, true);
        this.createdTooltip = DataService.formatDate(this.created);
        this.completedDisplay = DataService.formatDate(this.completed, true);
        this.completedTooltip = DataService.formatDate(this.completed);
        this.supersededDisplay = DataService.formatDate(this.superseded, true);
        this.supersededTooltip = DataService.formatDate(this.superseded);
        this.lastModifiedDisplay = DataService.formatDate(this.last_modified, true);
        this.lastModifiedTooltip = DataService.formatDate(this.last_modified);
        this.duration = DataService.calculateDuration(this.created, this.last_modified);
        this.jobMetrics = {};
        if (this.details) {
            _.forEach(this.details.nodes, node => {
                this.jobMetrics[node.node_type.job_type_name] = {
                    jobs_total: node.node_type.jobs_total ? node.node_type.jobs_total : 0,
                    jobs_pending: node.node_type.jobs_pending ? node.node_type.jobs_pending : 0,
                    jobs_blocked: node.node_type.jobs_blocked ? node.node_type.jobs_blocked : 0,
                    jobs_queued: node.node_type.jobs_queued ? node.node_type.jobs_queued : 0,
                    jobs_running: node.node_type.jobs_running ? node.node_type.jobs_running : 0,
                    jobs_failed: node.node_type.jobs_failed ? node.node_type.jobs_failed : 0,
                    jobs_completed: node.node_type.jobs_completed ? node.node_type.jobs_completed : 0,
                    jobs_canceled: node.node_type.jobs_canceled ? node.node_type.jobs_canceled : 0
                };
            });
        }
        this.jobs_pending_percentage = (this.jobs_pending / this.jobs_total) * 100;
        this.jobs_blocked_percentage = (this.jobs_blocked / this.jobs_total) * 100;
        this.jobs_queued_percentage = (this.jobs_queued / this.jobs_total) * 100;
        this.jobs_running_percentage = (this.jobs_running / this.jobs_total) * 100;
        this.jobs_failed_percentage = (this.jobs_failed / this.jobs_total) * 100;
        this.jobs_completed_percentage = (this.jobs_completed / this.jobs_total) * 100;
        this.jobs_canceled_percentage = (this.jobs_canceled / this.jobs_total) * 100;
        this.jobsArr = _.filter([
            { key: 'pending', percentage: this.jobs_pending_percentage, value: 0, field: 'jobs_pending' },
            { key: 'blocked', percentage: this.jobs_blocked_percentage, value: 0, field: 'jobs_blocked' },
            { key: 'queued', percentage: this.jobs_queued_percentage, value: 0, field: 'jobs_queued' },
            { key: 'running', percentage: this.jobs_running_percentage, value: 0, field: 'jobs_running' },
            { key: 'failed', percentage: this.jobs_failed_percentage, value: 0, field: 'jobs_failed' },
            { key: 'completed', percentage: this.jobs_completed_percentage, value: 0, field: 'jobs_completed' },
            { key: 'canceled', percentage: this.jobs_canceled_percentage, value: 0, field: 'jobs_canceled' }
        ], d => d.percentage > 0);
        this.jobsFields = {
            jobs_pending: this.jobs_pending,
            jobs_blocked: this.jobs_blocked,
            jobs_queued: this.jobs_queued,
            jobs_running: this.jobs_running,
            jobs_failed: this.jobs_failed,
            jobs_completed: this.jobs_completed,
            jobs_canceled: this.jobs_canceled
        };
    }
}
