import { WorkspaceConfiguration } from './api.configuration.model';
import {DataService} from '../../common/services/data.service';

export class Workspace {
    dataService: DataService;
    createdDisplay: string;
    createdTooltip: string;
    lastModifiedDisplay: string;
    lastModifiedTooltip: string;

    private static build(data) {
        if (data) {
            return new Workspace(
                data.id,
                data.name,
                data.title,
                data.description,
                data.base_url,
                data.is_active,
                data.created,
                data.deprecated,
                data.last_modified,
                WorkspaceConfiguration.transformer(data.configuration)
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => Workspace.build(item));
            }
            return Workspace.build(data);
        }
        return null;
    }
    constructor(
        public id: number,
        public name: string,
        public title: string,
        public description: string,
        public base_url: string,
        public is_active: boolean,
        public created: string,
        public deprecated: string,
        public last_modified: string,
        public configuration: WorkspaceConfiguration
    ) {
        this.dataService = new DataService();
        this.createdDisplay = this.dataService.formatDate(this.created, true);
        this.createdTooltip = this.dataService.formatDate(this.created);
        this.lastModifiedDisplay = this.dataService.formatDate(this.last_modified, true);
        this.lastModifiedTooltip = this.dataService.formatDate(this.last_modified);
    }
}

