import { RecipeTypeDefinition } from './definition.model';

export class RecipeType {
    private static build(data) {
        if (data) {
            return new RecipeType(
                data.id,
                data.name,
                data.title,
                data.description,
                data.is_active,
                data.definition,
                data.revision_num,
                data.created,
                data.last_modified,
                data.deprecated
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
        public definition: RecipeTypeDefinition,
        public revision_num: number,
        public created: string,
        public last_modified: string,
        public deprecated: string
    ) {}
}

