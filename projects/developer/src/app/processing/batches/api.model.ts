import { DataService } from '../../common/services/data.service';
import * as moment from 'moment';
import { environment } from '../../../environments/environment';

class BatchDefinition {
    constructor(
        public version?: string,
        public date_range?: any,
        public job_names?: any,
        public priority?: number,
        public trigger_rule?: any,
        public data?: any
    ) {
        this.version = this.version || null;
        this.date_range = this.date_range || {
            started: null,
            ended: null
        };
        this.job_names = this.job_names || [];
        this.priority = this.priority || null;
        this.trigger_rule = this.trigger_rule || {
            condition: {
                media_type: '',
                data_types: []
            }
        };
        this.data = this.data || {
            input_data_name: '',
            workspace_name: ''
        };
    }
}

export class Batch {
    dataService: DataService;
    created_formatted: string;
    last_modified_formatted: string;
    statusClass: string;
    createdTooltip: any;
    createdDisplay: any;
    lastModifiedTooltip: any;
    lastModifiedDisplay: any;

    private static build(data) {
        if (data) {
            return new Batch(
                data.id,
                data.title,
                data.description,
                data.recipe_type,
                data.event,
                data.creator_job,
                data.definition,
                data.created_count,
                data.failed_count,
                data.total_count,
                data.created,
                data.last_modified
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
        public event?: any,
        public creator_job?: any,
        public definition?: BatchDefinition,
        public created_count?: number,
        public failed_count?: number,
        public total_count?: number,
        public created?: string,
        public last_modified?: string
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
        this.id = this.id || null;
        this.title = this.title || null;
        this.description = this.description || null;
        this.recipe_type = this.recipe_type || null;
        this.event = this.event || null;
        this.creator_job = this.creator_job || null;
        this.definition = this.definition || new BatchDefinition();
        this.created_count = this.created_count || null;
        this.failed_count = this.failed_count || null;
        this.total_count = this.total_count || null;
        this.created = this.created || null;
        this.last_modified = this.last_modified || null;
    }
}
