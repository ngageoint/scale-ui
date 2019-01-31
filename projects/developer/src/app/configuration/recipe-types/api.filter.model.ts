import * as _ from 'lodash';

export class RecipeTypeFilter {
    private static build(data) {
        if (data) {
            // parse string value to array of array
            const fieldArrs = [];
            _.forEach(data.fields, field => {
                fieldArrs.push([field.substring(1, (field.length - 1)).split(',')]);
            });
            return new RecipeTypeFilter(
                data.name,
                data.type,
                data.condition,
                data.values,
                fieldArrs,
                data.all_fields,
                data.all_files
            );
        }
    }

    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => RecipeTypeFilter.build(item));
            }
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
