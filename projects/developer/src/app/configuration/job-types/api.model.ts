import * as _ from 'lodash';

import { DataService } from '../../common/services/data.service';

export class JobType {
    createdTooltip: any;
    createdDisplay: any;
    lastModifiedTooltip: any;
    lastModifiedDisplay: any;
    cpus: number;
    mem: any;
    disk: any;

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
        return {
            configuration: data.configuration || null,
            manifest: data.manifest || null
        };
    }

    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => JobType.build(item));
            }
            return JobType.build(data);
        }
        return JobType.cleanJobType(new JobType());
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
        const dataService = new DataService();
        this.createdTooltip = dataService.formatDate(this.created);
        this.createdDisplay = dataService.formatDate(this.created, true);
        this.lastModifiedTooltip = dataService.formatDate(this.last_modified);
        this.lastModifiedDisplay = dataService.formatDate(this.last_modified, true);
        if (this.manifest) {
            const cpus: any = this.manifest.job.resources ? _.find(this.manifest.job.resources.scalar, { name: 'cpus' }) : null;
            const mem: any = this.manifest.job.resources ? _.find(this.manifest.job.resources.scalar, { name: 'mem' }) : null;
            const disk: any = this.manifest.job.resources ? _.find(this.manifest.job.resources.scalar, { name: 'disk' }) : null;
            this.cpus = cpus ? cpus.value : null;
            this.mem = mem ? dataService.calculateFileSizeFromMib(mem.value) : null;
            this.disk = disk ? dataService.calculateFileSizeFromMib(disk.value) : null;
        }
    }
}
