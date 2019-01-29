import { SelectItem } from 'primeng/api';
import * as _ from 'lodash';

import { RecipeTypeDefinitionFile } from './api.definition.file.model';
import { RecipeTypeDefinitionJson } from './api.definition.json.model';

export class RecipeTypeDefinition {
    files_display: SelectItem[] = [];
    json_display: SelectItem[] = [];

    private static build(data) {
        if (data) {
            return new RecipeTypeDefinition(
                {
                    files: RecipeTypeDefinitionFile.transformer(data.input.files),
                    json: RecipeTypeDefinitionJson.transformer(data.input.json)
                },
                data.nodes
            );
        }
    }

    public static transformer(data) {
        if (data) {
            return RecipeTypeDefinition.build(data);
        }
        return new RecipeTypeDefinition([], []);
    }

    public addFile(file): object {
        if (!this.input.files || !Array.isArray(this.input.files)) {
            this.input.files = [];
        }
        file = _.pickBy(file, d => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const fileToAdd = RecipeTypeDefinitionFile.transformer(file);
        this.input.files.push(fileToAdd);
        this.files_display.push({
            label: JSON.stringify(file, null, 4),
            value: fileToAdd
        });
        return fileToAdd;
    }

    public removeFile(file): object {
        const fileToRemove = RecipeTypeDefinitionFile.transformer(file);
        _.remove(this.input.files, f => {
            return _.isEqual(f, fileToRemove);
        });
        _.remove(this.files_display, (f: any) => {
            return _.isEqual(f.value, file);
        });
        return fileToRemove;
    }

    public addJson(json): object {
        if (!this.input.json || !Array.isArray(this.input.json)) {
            this.input.json = [];
        }
        json = _.pickBy(json, d => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const jsonToAdd = RecipeTypeDefinitionJson.transformer(json);
        this.input.json.push(jsonToAdd);
        this.json_display.push({
            label: JSON.stringify(json, null, 4),
            value: jsonToAdd
        });
        return jsonToAdd;
    }

    public removeJson(json): object {
        const jsonToRemove = RecipeTypeDefinitionJson.transformer(json);
        _.remove(this.input.json, j => {
            return _.isEqual(j, jsonToRemove);
        });
        _.remove(this.json_display, (j: any) => {
            return _.isEqual(j.value, json);
        });
        return jsonToRemove;
    }

    constructor(
        public input: any,
        public nodes: any,
    ) {
        if (this.input.files) {
            _.forEach(this.input.files, file => {
                this.files_display.push({
                    label: JSON.stringify(file, null, 4),
                    value: RecipeTypeDefinitionFile.transformer(file)
                });
            });
        }

        if (this.input.json) {
            _.forEach(this.input.json, json => {
                this.json_display.push({
                    label: JSON.stringify(json, null, 4),
                    value: RecipeTypeDefinitionJson.transformer(json)
                });
            });
        }
    }
}
