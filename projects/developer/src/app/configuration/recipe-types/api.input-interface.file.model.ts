export class RecipeTypeInputInterfaceFile {
    private static build(data) {
        if (data) {
            return new RecipeTypeInputInterfaceFile(
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
                return data.map(item => RecipeTypeInputInterfaceFile.build(item));
            }
            return RecipeTypeInputInterfaceFile.build(data);
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
