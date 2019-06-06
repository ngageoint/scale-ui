import * as _ from 'lodash';

import { DataService } from '../../common/services/data.service';
import { DashboardJobsService } from '../../dashboard/jobs.service';

export class JobType {
    createdTooltip: any;
    createdDisplay: any;
    lastModifiedTooltip: any;
    lastModifiedDisplay: any;
    cpus: number;
    mem: any;
    disk: any;
    favoriteIcon: string;
    dashboardJobsService = new DashboardJobsService();
    unmetResourcesTooltip = '';

    private static build(data) {
        if (data) {
            return new JobType(
                data.id,
                data.name,
                data.version,
                data.title,
                data.description,
                data.icon_code,
                data.is_published,
                data.is_active,
                data.is_paused,
                data.is_system,
                data.max_scheduled,
                data.revision_num,
                data.docker_image,
                data.unmet_resources,
                data.manifest,
                data.configuration,
                data.created,
                data.deprecated,
                data.paused,
                data.last_modified
            );
        }
    }

    public static cleanJobType(data) {
        if (data.configuration) {
            // remove falsey values from configuration
            DataService.removeEmpty(data.configuration);
            // data.configuration = _.pickBy(data.configuration, d => {
            //     return d !== null && typeof d !== 'undefined' && d !== '';
            // });
        }
        return {
            configuration: data.configuration || null,
            manifest: data.manifest || null
        };
    }

    public static initialJobType(data) {
        return {
            icon_code: data.icon_code || null,
            docker_image: data.docker_image || null,
            manifest: data.manifest || null,
            configuration: data.configuration || {
                output_workspaces: {
                    default: '',
                    outputs: {}
                },
                mounts: {},
                settings: {}
            }
        };
    }

    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => JobType.build(item));
            }
            return JobType.build(data);
        }
        return JobType.initialJobType(new JobType());
    }

    constructor(
        public id?: number,
        public name?: string,
        public version?: string,
        public title?: string,
        public description?: string,
        public icon_code?: string,
        public is_published?: boolean,
        public is_active?: boolean,
        public is_paused?: boolean,
        public is_system?: boolean,
        public max_scheduled?: number,
        public revision_num?: number,
        public docker_image?: string,
        public unmet_resources?: any,
        public manifest?: any,
        public configuration?: any,
        public created?: string,
        public deprecated?: string,
        public paused?: string,
        public last_modified?: string
    ) {
        this.createdTooltip = DataService.formatDate(this.created);
        this.createdDisplay = DataService.formatDate(this.created, true);
        this.lastModifiedTooltip = DataService.formatDate(this.last_modified);
        this.lastModifiedDisplay = DataService.formatDate(this.last_modified, true);
        if (this.manifest) {
            const cpus: any = this.manifest.job.resources ? _.find(this.manifest.job.resources.scalar, { name: 'cpus' }) : null;
            const mem: any = this.manifest.job.resources ? _.find(this.manifest.job.resources.scalar, { name: 'mem' }) : null;
            const disk: any = this.manifest.job.resources ? _.find(this.manifest.job.resources.scalar, { name: 'disk' }) : null;
            this.cpus = cpus ? cpus.value : null;
            this.mem = mem ? DataService.calculateFileSizeFromMib(mem.value) : null;
            this.disk = disk ? DataService.calculateFileSizeFromMib(disk.value) : null;
        }
        this.favoriteIcon = this.dashboardJobsService.isFavorite(this) ? 'fa fa-star' : 'fa fa-star-o';
        if (this.unmet_resources) {
            _.forEach(this.unmet_resources.split(','), resource => {
                this.unmetResourcesTooltip = this.unmetResourcesTooltip === '' ?
                    _.upperCase(resource) :
                    `${this.unmetResourcesTooltip}, ${_.upperCase(resource)}`;
            });
            this.unmetResourcesTooltip = `This job type cannot be scheduled due to the following unmet resources: ${this.unmetResourcesTooltip}`; // tslint:disable-line:max-line-length
        }
    }
}
