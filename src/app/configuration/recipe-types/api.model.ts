import { JobType } from '../job-types/api.model';
import { RecipeTypeDefinition } from './definition.model';

export class RecipeType {
    constructor(
        public id: number,
        public name: string,
        public version: string,
        public title: string,
        public description: string,
        public is_active: boolean,
        public definition: RecipeTypeDefinition,
        public revision_num: number,
        public created: string,
        public last_modified: string,
        public archived: string,
        public trigger_rule: object,
        public job_types: JobType[]
    ) {}
}

