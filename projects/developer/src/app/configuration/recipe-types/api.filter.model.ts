import * as _ from 'lodash';

export class RecipeTypeFilter {
    private static build(data) {
        if (data) {
            // parse string value to array of array
            const fieldArrs = [];
            _.forEach(data.fields, field => {
                if (typeof field === 'string') {
                    fieldArrs.push([_.map(field.substring(1, (field.length - 1)).split(','), _.trim)]);
                } else {
                    fieldArrs.push(field);
                }
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
        if (!data) {
            data = {
                name: 'Untitled filter',
                type: 'boolean',
                condition: '==',
                values: [false],
                fields: [],
                all_fields: true,
                all_files: false
            };
        }
        if (Array.isArray(data)) {
            return data.map(item => RecipeTypeFilter.build(item));
        }
        return RecipeTypeFilter.build(data);
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
