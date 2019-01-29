export class RecipeTypeDefinitionJson {
    private static build(data) {
        if (data) {
            return new RecipeTypeDefinitionJson(
                data.name,
                data.required,
                data.type
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => RecipeTypeDefinitionJson.build(item));
            }
            return RecipeTypeDefinitionJson.build(data);
        }
        return [];
    }
    constructor(
        public name: string,
        public required: boolean,
        public type: string
    ) {}
}
