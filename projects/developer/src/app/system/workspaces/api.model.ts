import { WorkspaceConfiguration } from './api.configuration.model';
import { DataService } from '../../common/services/data.service';

export class Workspace {
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
        return new Workspace(
            null,
            'untitled-workspace',
            'Untitled Workspace',
            null,
            null,
            null,
            null,
            null,
            null,
            WorkspaceConfiguration.transformer(null)
        );
    }

    public static cleanWorkspaceForValidate(workspace) {
        return {
            name: workspace.name,
            title: workspace.title,
            description: workspace.description,
            base_url: workspace.base_url,
            is_active: workspace.is_active,
            configuration: workspace.configuration
        };
    }

    public static cleanWorkspaceForSave(workspace) {
        return {
            title: workspace.title,
            description: workspace.description,
            base_url: workspace.base_url,
            is_active: workspace.is_active,
            configuration: workspace.configuration
        };
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
        this.createdDisplay = DataService.formatDate(this.created, true);
        this.createdTooltip = DataService.formatDate(this.created);
        this.lastModifiedDisplay = DataService.formatDate(this.last_modified, true);
        this.lastModifiedTooltip = DataService.formatDate(this.last_modified);
    }
}

