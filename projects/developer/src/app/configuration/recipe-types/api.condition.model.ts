import { RecipeTypeInputFile } from './api.input.file.model';
import { RecipeTypeInputJson} from './api.input.json.model';
import {RecipeTypeFilterInterface} from './api.filter-interface.model';

export class RecipeTypeCondition {
    display: any;
    interface: any;

    private static build(data) {
        if (data) {
            return new RecipeTypeCondition(
                {
                    files: RecipeTypeInputFile.transformer(data.condition_interface.files),
                    json: RecipeTypeInputJson.transformer(data.condition_interface.json)
                },
                RecipeTypeFilterInterface.transformer(data.data_filter)
            );
        }
    }
    public static transformer(data) {
        if (!data) {
            data = {
                condition_interface: {
                    files: [],
                    json: []
                },
                data_filter: {
                    filters: [],
                    all: true
                }
            };
        }
        if (Array.isArray(data)) {
            return data.map(item => RecipeTypeCondition.build(item));
        }
        return RecipeTypeCondition.build(data);
    }
    constructor(
        public condition_interface: any,
        public data_filter: any
    ) {
        this.interface = condition_interface;
        const c = {
            interface: this.interface,
            data_filter: this.data_filter
        };
        this.display = {
            label: JSON.stringify(c, null, 4),
            value: c
        };
    }
}
