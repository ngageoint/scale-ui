import * as _ from 'lodash';

import { DataService } from '../../common/services/data.service';

export class JobType {
    cpus: number;
    mem: any;
    disk: any;
    interfaceData: any = {
        data: [
            {
                data: {
                    name: 'Inputs'
                },
                children: []
            }
        ]
    };
    private static build(data) {
        if (data) {
            return new JobType(
                data.id,
                data.name,
                data.version,
                data.title,
                data.description,
                data.icon_code,
                data.is_active,
                data.is_paused,
                data.is_system,
                data.max_scheduled,
                data.revision_num,
                data.docker_image,
                data.manifest,
                data.configuration,
                data.created,
                data.deprecated,
                data.paused,
                data.last_modified
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => JobType.build(item));
            }
            return JobType.build(data);
        }
        return null;
    }
    constructor(
        public id: number,
        public name: string,
        public version: string,
        public title: string,
        public description: string,
        public icon_code: string,
        public is_active: boolean,
        public is_paused: boolean,
        public is_system: boolean,
        public max_scheduled: number,
        public revision_num: number,
        public docker_image: string,
        public manifest: any,
        public configuration: any,
        public created: string,
        public archived: string,
        public paused: string,
        public last_modified: string
    ) {
        const dataService = new DataService();
        const cpus: any = _.find(this.manifest.job.resources.scalar, { name: 'cpus' });
        const mem: any = _.find(this.manifest.job.resources.scalar, { name: 'mem' });
        const disk: any = _.find(this.manifest.job.resources.scalar, { name: 'disk' });
        this.cpus = cpus.value || null;
        this.mem = dataService.calculateFileSizeFromMib(mem.value) || null;
        this.disk = dataService.calculateFileSizeFromMib(disk.value) || null;
        _.forEach(this.manifest.job.interface.inputs.files, file => {
            this.interfaceData.data[0].children.push({
                data: {
                    name: file.name,
                    required: file.required,
                    mediaTypes: file.mediaTypes
                }
            });
        });
    }
}
