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
        this.dataService = new DataService();
        this.createdDisplay = this.dataService.formatDate(this.created, true);
        this.createdTooltip = this.dataService.formatDate(this.created);
        this.completedDisplay = this.dataService.formatDate(this.completed, true);
        this.completedTooltip = this.dataService.formatDate(this.completed);
        this.supersededDisplay = this.dataService.formatDate(this.superseded, true);
        this.supersededTooltip = this.dataService.formatDate(this.superseded);
        this.lastModifiedDisplay = this.dataService.formatDate(this.last_modified, true);
        this.lastModifiedTooltip = this.dataService.formatDate(this.last_modified);
        this.duration = this.dataService.calculateDuration(this.created, this.last_modified);
    }
}
