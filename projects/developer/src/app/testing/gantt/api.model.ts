import * as _ from 'lodash';

import { DataService } from '../../common/services/data.service';

export class Recipe {
    dataService: DataService;
    createdDisplay: string;
    createdTooltip: string;
    deprecatedDisplay: string;
    deprecatedTooltip: string;
    duration: string;

    private static build(data) {
        if (data) {
            return new Recipe(
                data.id,
                data.name,
                data.title,
                data.created,
                data.deprecated,
                data.is_active,
                data.recipeType
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => Recipe.build(item));
            }
            return Recipe.build(data);
        }
        return null;
    }
    constructor(
        public id: number,
        public name: string,
        public title: string,
        public created: object,
        public deprecated: object,
        public is_active: any,
        public recipeType: any
    ) {
        this.createdDisplay = DataService.formatDate(this.created, true);
        this.createdTooltip = DataService.formatDate(this.created);
        this.deprecatedDisplay = DataService.formatDate(this.deprecated, true);
        this.deprecatedTooltip = DataService.formatDate(this.deprecated);
        this.duration = DataService.calculateDuration(this.created, this.deprecated);
    }
}
