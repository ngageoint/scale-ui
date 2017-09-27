export class Recipe {
    private static build(data) {
        if (data) {
            return new Recipe(
                data.id,
                data.recipe_type,
                data.recipe_type_rev,
                data.event,
                data.is_superseded,
                data.root_superseded_recipe,
                data.superseded_recipe,
                data.superseded_by_recipe,
                data.created,
                data.completed,
                data.superseded,
                data.last_modified,
                data.data,
                data.inputs,
                data.jobs
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => Recipe.build(item));
            }
            return Recipe.build(data);
        }
        return null;
    }
    constructor(
        public id: number,
        public recipe_type: object,
        public recipe_type_rev: object,
        public event: object,
        public is_superseded: boolean,
        public root_superseded_recipe: object,
        public superseded_recipe: object,
        public superseded_by_recipe: object,
        public created: string,
        public completed: string,
        public superseded: string,
        public last_modified: string,
        public data: object,
        public inputs: Array<object>,
        public jobs: Array<object>
    ) {}
}
