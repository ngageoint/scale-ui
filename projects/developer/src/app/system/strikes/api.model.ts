import { DataService } from '../../common/services/data.service';
import { Job } from '../../processing/jobs/api.model';
import { StrikeConfiguration } from './api.configuration.model';

export class Strike {
    createdDisplay: string;
    createdTooltip: string;
    lastModifiedDisplay: string;
    lastModifiedTooltip: string;
    configurationDisplay: string;

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
                data.configuration ? StrikeConfiguration.transformer(data.configuration) : data.configuration
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
        return new Strike(null, 'untitled-strike', 'Untitled Strike', null, null, null, null, StrikeConfiguration.transformer(null));
    }

    public static cleanStrikeForValidate(strike) {
        return {
            name: strike.name,
            title: strike.title,
            description: strike.description,
            configuration: strike.configuration
        };
    }

    public static cleanStrikeForSave(strike) {
        return {
            title: strike.title,
            description: strike.description,
            configuration: {
                workspace: strike.configuration.workspace,
                monitor: strike.configuration.monitor,
                files_to_ingest: strike.configuration.files_to_ingest,
                recipe: strike.configuration.recipe
            }
        };
    }

    constructor(
        public id: number,
        public name: string,
        public title: string,
        public description: string,
        public job: Job,
        public created: string,
        public last_modified: string,
        public configuration: any
    ) {
        this.createdDisplay = DataService.formatDate(this.created, true);
        this.createdTooltip = DataService.formatDate(this.created);
        this.lastModifiedDisplay = DataService.formatDate(this.last_modified, true);
        this.lastModifiedTooltip = DataService.formatDate(this.last_modified);
        if (this.configuration) {
            this.configurationDisplay = JSON.stringify(this.configuration, null, 4);
        }
    }
}
