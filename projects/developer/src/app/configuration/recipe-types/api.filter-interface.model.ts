import { SelectItem } from 'primeng/api';
import * as _ from 'lodash';

import { RecipeTypeFilter } from './api.filter.model';

export class RecipeTypeFilterInterface {
    filters_display: SelectItem[] = [];

    private static build(data) {
        if (data) {
            return new RecipeTypeFilterInterface(
                RecipeTypeFilter.transformer(data.filters),
                data.all
            );
        }
    }

    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => RecipeTypeFilterInterface.build(item));
            }
            return RecipeTypeFilterInterface.build(data);
        }
        return [];
    }

    public addFilter(filter): object {
        if (!this.filters || !Array.isArray(this.filters)) {
            this.filters = [];
        }
        filter = _.pickBy(filter, d => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const filterToAdd = RecipeTypeFilter.transformer(filter);
        this.filters.push(filterToAdd);
        this.filters_display.push({
            label: JSON.stringify(filter, null, 4),
            value: filterToAdd
        });
        return filterToAdd;
    }

    public removeFilter(filter): object {
        const filterToRemove = RecipeTypeFilter.transformer(filter);
        _.remove(this.filters, f => {
            return _.isEqual(f, filterToRemove);
        });
        _.remove(this.filters_display, (f: any) => {
            return _.isEqual(f.value, filter);
        });
        return filterToRemove;
    }

    constructor(
        public filters: any,
        public all: boolean
    ) {
        if (this.filters) {
            _.forEach(this.filters, f => {
                this.filters_display.push({
                    label: JSON.stringify(f, null, 4),
                    value: RecipeTypeFilter.transformer(f)
                });
            });
        }
    }
}
