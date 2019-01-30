export class RecipeTypeInputJson {
    private static build(data) {
        if (data) {
            return new RecipeTypeInputJson(
                data.name,
                data.required,
                data.type
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => RecipeTypeInputJson.build(item));
            }
            return RecipeTypeInputJson.build(data);
        }
        return [];
    }
    constructor(
        public name: string,
        public required: boolean,
        public type: string
    ) {}
}
