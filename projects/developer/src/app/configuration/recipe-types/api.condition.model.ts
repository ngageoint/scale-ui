import { RecipeTypeInputFile } from './api.input.file.model';
import { RecipeTypeInputJson} from './api.input.json.model';
import { RecipeTypeFilterInterface } from './api.filter-interface.model';

export class RecipeTypeCondition {
    display: any;
    interface: any;

    private static build(data) {
        if (data) {
            return new RecipeTypeCondition(
                data.name,
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
                name: '',
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
        public name: string,
        public condition_interface: any,
        public data_filter: any
    ) {
        this.interface = condition_interface;
        const c = {
            name: this.name,
            interface: 'Provided by job dependency',
            data_filter: {
                filters: this.data_filter.filters,
                all: this.data_filter.all
            }
        };
        this.display = {
            label: JSON.stringify(c, null, 4),
            value: {
                interface: this.condition_interface,
                data_filter: this.data_filter
            }
        };
    }
}
