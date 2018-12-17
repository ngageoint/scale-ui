import { RecipeTypeDefinition } from './definition.model';
import { JobType } from '../job-types/api.model';

export class RecipeType {
    private static build(data) {
        if (data) {
            return new RecipeType(
                data.id,
                data.name,
                data.title,
                data.description,
                data.is_active,
                data.is_system,
                data.revision_num,
                data.definition,
                data.job_types,
                data.sub_recipe_types,
                data.created,
                data.deprecated,
                data.last_modified
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => RecipeType.build(item));
            }
            return RecipeType.build(data);
        }
        return null;
    }
    constructor(
        public id: number,
        public name: string,
        public title: string,
        public description: string,
        public is_active: boolean,
        public is_system: boolean,
        public revision_num: number,
        public definition: RecipeTypeDefinition,
        public job_types: JobType[],
        public sub_recipe_types: any,
        public created: string,
        public deprecated: string,
        public last_modified: string
    ) {}
}
