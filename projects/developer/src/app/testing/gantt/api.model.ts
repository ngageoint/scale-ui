import { RecipeTypeInput } from '../../configuration/recipe-types/api.input.model';
import { JobType } from '../../configuration/job-types/api.model';
import * as _ from 'lodash';
import {RecipeTypeFilter} from '../../configuration/recipe-types/api.filter.model';

export class RecipeType {
    conditions = [];

    private static build(data) {
        if (data) {
            const definition = data.definition ?
                {
                    input: RecipeTypeInput.transformer(data.definition.input),
                    nodes: data.definition.nodes
                } :
                data.definition;
            return new RecipeType(
                data.id,
                data.name,
                data.title,
                data.description,
                data.is_active,
                data.is_system,
                data.revision_num,
                definition,
                data.job_types,
                data.sub_recipe_types,
                data.created,
                data.deprecated,
                data.last_modified
            );
        }
    }

    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => RecipeType.build(item));
            }
            return RecipeType.build(data);
        }
        return null;
    }

    public static cleanDefinition(definition) {
        return {
            input: {
                files: definition.input.files,
                json: definition.input.json
            },
            nodes: definition.input.nodes
        };
    }

    public addCondition(condition) {
        if (!this.conditions || !Array.isArray(this.conditions)) {
            this.conditions = [];
        }
        this.conditions.push(condition);
    }

    public removeCondition(condition) {
        _.remove(this.conditions, c => {
            return _.isEqual(c, condition);
        });
    }

    constructor(
        public id: number,
        public name: string,
        public title: string,
        public description: string,
        public is_active: boolean,
        public is_system: boolean,
        public revision_num: number,
        public definition: any,
        public job_types: JobType[],
        public sub_recipe_types: any,
        public created: string,
        public deprecated: string,
        public last_modified: string
    ) {}
}
