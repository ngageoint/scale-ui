export class RecipeTypeFilter {
    private static build(data) {
        if (data) {
            return new RecipeTypeFilter(
                data.name,
                data.type,
                data.condition,
                data.values,
                data.fields,
                data.all_fields,
                data.all_files
            );
        }
    }

    public static transformer(data) {
        if (data) {
            return RecipeTypeFilter.build(data);
        }
        return new RecipeTypeFilter('', '', '', [], [], true, false);
    }

    constructor(
        public name: string,
        public type: string,
        public condition: string,
        public values: any,
        public fields: any,
        public all_fields: boolean,
        public all_files: boolean
    ) {}
}
