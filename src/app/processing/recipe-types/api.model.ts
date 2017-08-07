import { JobType } from '../job-types/api.model';

export class RecipeType {
    constructor(
        public id: number,
        public name: string,
        public version: string,
        public title: string,
        public description: string,
        public is_active: boolean,
        public definition: object,
        public revision_num: number,
        public created: string,
        public last_modified: string,
        public archived: string,
        public trigger_rule: object,
        public job_types: JobType[]
    ) {}
}
