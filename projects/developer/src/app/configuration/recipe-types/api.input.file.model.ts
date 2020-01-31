export class RecipeTypeInputFile {
    private static build(data) {
        if (data) {
            return new RecipeTypeInputFile(
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
                return data.map(item => RecipeTypeInputFile.build(item));
            }
            return RecipeTypeInputFile.build(data);
        }
        return [];
    }
    constructor(
        public name: string,
        public required: boolean,
        public media_types: any,
        public multiple: boolean
    ) {
        // ensure values are set to a boolean value to prevent api issues
        this.multiple = Boolean(this.multiple);
        this.required = Boolean(this.required);
    }
}
