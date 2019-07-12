import { RecipeTypeInput } from './api.input.model';
import { JobType } from '../job-types/api.model';
import * as _ from 'lodash';

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
        const files = _.forEach(definition.input.files, file => {
            delete file.disabled;
        });
        _.forEach(definition.nodes, node => {
            _.forEach(node.dependencies, d => {
                delete d.connections;
                delete d.type;
            });

            if (_.has(node, 'node_type.data_filter.filters_display')) {
                delete node.node_type.data_filter.filters_display;
            }
            if (_.has(node, 'node_type.name')) {
                delete node.node_type.name;
            }
            if (_.has(node, 'node_type.data_filter.filters')) {
                _.forEach(node.node_type.data_filter.filters, filter => {
                    if (filter.fields && filter.fields.length < 1) {
                        delete filter.fields;
                    }
                });
            }
        });
        return {
            input: {
                files: files,
                json: definition.input.json
            },
            nodes: definition.nodes
        };
    }

    public static cleanRecipeTypeForValidate(recipeType) {
        return {
            name: recipeType.name || _.kebabCase(recipeType.title),
            definition: this.cleanDefinition(recipeType.definition)
        };
    }

    public static cleanRecipeTypeForSave(recipeType) {
        return {
            title: recipeType.title,
            description: recipeType.description,
            definition: this.cleanDefinition(recipeType.definition)
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
