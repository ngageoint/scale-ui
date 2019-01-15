import { DataService } from '../../common/services/data.service';
import { Job } from '../../processing/jobs/api.model';
import { StrikeConfiguration } from './api.configuration.model';

export class Strike {
    dataService: DataService;
    createdDisplay: string;
    createdTooltip: string;
    lastModifiedDisplay: string;
    lastModifiedTooltip: string;
    private static build(data) {
        if (data) {
            return new Strike(
                data.id,
                data.name,
                data.title,
                data.description,
                data.job,
                data.created,
                data.last_modified,
                StrikeConfiguration.transformer(data.configuration)
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => Strike.build(item));
            }
            return Strike.build(data);
        }
        return null;
    }
    constructor(
        public id: number,
        public name: string,
        public title: string,
        public description: string,
        public job: Job,
        public created: string,
        public last_modified: string,
        public configuration: StrikeConfiguration
    ) {
        this.dataService = new DataService();
        this.createdDisplay = this.dataService.formatDate(this.created, true);
        this.createdTooltip = this.dataService.formatDate(this.created);
        this.lastModifiedDisplay = this.dataService.formatDate(this.last_modified, true);
        this.lastModifiedTooltip = this.dataService.formatDate(this.last_modified);
    }
}
