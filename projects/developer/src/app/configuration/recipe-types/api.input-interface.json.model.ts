export class RecipeTypeInputInterfaceJson {
    private static build(data) {
        if (data) {
            return new RecipeTypeInputInterfaceJson(
                data.name,
                data.required,
                data.type
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => RecipeTypeInputInterfaceJson.build(item));
            }
            return RecipeTypeInputInterfaceJson.build(data);
        }
        return [];
    }
    constructor(
        public name: string,
        public required: boolean,
        public type: string
    ) {}
}
