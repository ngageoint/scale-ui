export class RecipeTypeDefinitionFile {
    private static build(data) {
        if (data) {
            return new RecipeTypeDefinitionFile(
                data.name,
                data.required,
                data.media_types,
                data.multiple
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => RecipeTypeDefinitionFile.build(item));
            }
            return RecipeTypeDefinitionFile.build(data);
        }
        return [];
    }
    constructor(
        public name: string,
        public required: boolean,
        public media_types: any,
        public multiple: boolean
    ) {}
}
