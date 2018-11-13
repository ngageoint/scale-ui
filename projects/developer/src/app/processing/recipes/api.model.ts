import { environment } from '../../../environments/environment';
import { DataService } from '../../common/services/data.service';
import * as moment from 'moment';

export class Recipe {
    dataService: DataService;
    created_formatted: string;
    completed_formatted: string;
    superseded_formatted: string;
    last_modified_formatted: string;
    duration: string;

    private static build(data) {
        if (data) {
            return new Recipe(
                data.id,
                data.recipe_type,
                data.recipe_type_rev,
                data.event,
                data.is_superseded,
                data.root_superseded_recipe,
                data.superseded_recipe,
                data.superseded_by_recipe,
                data.created,
                data.completed,
                data.superseded,
                data.last_modified,
                data.data,
                data.inputs,
                data.jobs,
                data.selected
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
        public recipe_type: object,
        public recipe_type_rev: object,
        public event: object,
        public is_superseded: boolean,
        public root_superseded_recipe: object,
        public superseded_recipe: object,
        public superseded_by_recipe: object,
        public created: string,
        public completed: string,
        public superseded: string,
        public last_modified: string,
        public data: object,
        public inputs: Array<object>,
        public jobs: Array<object>,
        public selected: boolean
    ) {
        this.dataService = new DataService();
        this.created_formatted = moment.utc(this.created).format(environment.dateFormat);
        this.completed_formatted = this.completed ? moment.utc(this.completed).format(environment.dateFormat) : '';
        this.superseded_formatted = moment.utc(this.superseded).format(environment.dateFormat);
        this.last_modified_formatted = moment.utc(this.last_modified).format(environment.dateFormat);
        this.duration = this.dataService.calculateDuration(this.created, this.last_modified);
    }
}
