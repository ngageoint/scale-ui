export class Recipe {
    constructor(
        public id: number,
        public recipe_type: object,
        public recipe_type_rev: object,
        public event: object,
        public is_superseded: boolean,
        public root_superseded_recipe: object,
        public superseded_recipe: object,
        public superseded_by_recipe: object,
        public created: Date,
        public completed: Date,
        public superseded: Date,
        public last_modified: Date,
        public data: object,
        public inputs: Array<object>,
        public jobs: Array<object>
    ) {}
}
