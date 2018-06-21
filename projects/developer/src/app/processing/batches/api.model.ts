import { DataService } from '../../common/services/data.service';
import * as moment from 'moment';
import { environment } from '../../../environments/environment';

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
                data.status,
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
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => Batch.build(item));
            }
            return Batch.build(data);
        }
        return null;
    }

    constructor(
        public id: number,
        public title: string,
        public description: string,
        public status: any,
        public recipe_type: any,
        public event: any,
        public creator_job: any,
        public definition: any,
        public created_count: number,
        public failed_count: number,
        public total_count: number,
        public created: string,
        public last_modified: string
    ) {
        this.dataService = new DataService();
        this.created_formatted = moment.utc(this.created).format(environment.dateFormat);
        this.last_modified_formatted = moment.utc(this.last_modified).format(environment.dateFormat);
        this.createdTooltip = this.dataService.formatDate(this.created);
        this.createdDisplay = this.dataService.formatDate(this.created, true);
        this.lastModifiedTooltip = this.dataService.formatDate(this.last_modified);
        this.lastModifiedDisplay = this.dataService.formatDate(this.last_modified, true);
    }
}
