import { SelectItem } from 'primeng/api';
import * as _ from 'lodash';

import { RecipeTypeInputFile } from './api.input.file.model';
import { RecipeTypeInputJson} from './api.input.json.model';
import { RecipeTypeFilter } from './api.filter.model';

export class RecipeTypeCondition {
    display: any;
    filters_display: SelectItem[] = [];

    private static build(data) {
        if (data) {
            return new RecipeTypeCondition(
                {
                    files: RecipeTypeInputFile.transformer(data.condition_interface.files),
                    json: RecipeTypeInputJson.transformer(data.condition_interface.json)
                },
                data.data_filter
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => RecipeTypeCondition.build(item));
            }
            return RecipeTypeCondition.build(data);
        }
        return new RecipeTypeCondition({ files: [], json: [] }, { filters: [], all: true });
    }
    constructor(
        public condition_interface: any,
        public data_filter: any
    ) {
        const c = {
            interface: this.condition_interface,
            data_filter: this.data_filter
        };
        this.display = {
            label: JSON.stringify(c, null, 4),
            value: c
        };
        if (this.data_filter.files) {
            _.forEach(this.data_filter.filters, f => {
                this.filters_display.push({
                    label: JSON.stringify(f, null, 4),
                    value: RecipeTypeFilter.transformer(f)
                });
            });
        }
    }
}
