import { DataService } from '../../common/services/data.service';
import { Job } from '../../processing/jobs/api.model';
import { StrikeConfiguration } from './api.configuration.model';
import * as _ from 'lodash';

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
            configuration: {
                workspace: strike.configuration.workspace,
                monitor: _.pickBy(strike.configuration.monitor, d => d !== null && typeof d !== 'undefined' && d !== ''),
                files_to_ingest: strike.configuration.files_to_ingest,
                recipe: strike.configuration.recipe
            }
        };
    }

    public static cleanStrikeForSave(strike) {
        let returnStrike;

        if (!strike.configuration.monitor.credentials) {
            returnStrike = {
                title: strike.title,
                description: strike.description,
                configuration: {
                    workspace: strike.configuration.workspace,
                    monitor: {
                        type: strike.configuration.monitor.type,
                        sqs_name: strike.configuration.monitor.sqs_name,
                        region_name: _.pickBy(strike.configuration.monitor.type,
                            d => d !== null && typeof d !== 'undefined' && d !== ''),
                    },
                    files_to_ingest: strike.configuration.files_to_ingest,
                    recipe: strike.configuration.recipe
                }
            };
        } else {
            returnStrike = {
                title: strike.title,
                description: strike.description,
                configuration: {
                    workspace: strike.configuration.workspace,
                    monitor: {
                        type: strike.configuration.monitor.type,
                        sqs_name: strike.configuration.monitor.sqs_name,
                        credentials: _.pickBy(strike.configuration.monitor.credentials,
                            d => d !== null && typeof d !== 'undefined' && d !== ''),
                        region_name: _.pickBy(strike.configuration.monitor.type,
                            d => d !== null && typeof d !== 'undefined' && d !== ''),
                    },
                    files_to_ingest: strike.configuration.files_to_ingest,
                    recipe: strike.configuration.recipe
                }
            };
        }


        return _.pickBy(returnStrike, d => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
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
            const config = _.clone(this.configuration);
            delete config.files_to_ingest_display;
            this.configurationDisplay = JSON.stringify(config, null, 4);
        }
    }
}
