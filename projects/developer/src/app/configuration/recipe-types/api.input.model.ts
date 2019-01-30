import { SelectItem } from 'primeng/api';
import * as _ from 'lodash';

import { RecipeTypeInputFile } from './api.input.file.model';
import { RecipeTypeInputJson } from './api.input.json.model';

export class RecipeTypeInput {
    files_display: SelectItem[] = [];
    json_display: SelectItem[] = [];

    private static build(data) {
        if (data) {
            return new RecipeTypeInput(
                RecipeTypeInputFile.transformer(data.files),
                RecipeTypeInputJson.transformer(data.json)
            );
        }
    }

    public static transformer(data) {
        if (data) {
            return RecipeTypeInput.build(data);
        }
        return new RecipeTypeInput([], []);
    }

    public addFile(file): object {
        if (!this.files || !Array.isArray(this.files)) {
            this.files = [];
        }
        file = _.pickBy(file, d => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const fileToAdd = RecipeTypeInputFile.transformer(file);
        this.files.push(fileToAdd);
        this.files_display.push({
            label: JSON.stringify(file, null, 4),
            value: fileToAdd
        });
        return fileToAdd;
    }

    public removeFile(file): object {
        const fileToRemove = RecipeTypeInputFile.transformer(file);
        _.remove(this.files, f => {
            return _.isEqual(f, fileToRemove);
        });
        _.remove(this.files_display, (f: any) => {
            return _.isEqual(f.value, file);
        });
        return fileToRemove;
    }

    public addJson(json): object {
        if (!this.json || !Array.isArray(this.json)) {
            this.json = [];
        }
        json = _.pickBy(json, d => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const jsonToAdd = RecipeTypeInputJson.transformer(json);
        this.json.push(jsonToAdd);
        this.json_display.push({
            label: JSON.stringify(json, null, 4),
            value: jsonToAdd
        });
        return jsonToAdd;
    }

    public removeJson(json): object {
        const jsonToRemove = RecipeTypeInputJson.transformer(json);
        _.remove(this.json, j => {
            return _.isEqual(j, jsonToRemove);
        });
        _.remove(this.json_display, (j: any) => {
            return _.isEqual(j.value, json);
        });
        return jsonToRemove;
    }

    constructor(
        public files: any,
        public json: any,
    ) {
        if (this.files) {
            _.forEach(this.files, f => {
                this.files_display.push({
                    label: JSON.stringify(f, null, 4),
                    value: RecipeTypeInputFile.transformer(f)
                });
            });
        }

        if (this.json) {
            _.forEach(this.json, j => {
                this.json_display.push({
                    label: JSON.stringify(j, null, 4),
                    value: RecipeTypeInputJson.transformer(j)
                });
            });
        }
    }
}
