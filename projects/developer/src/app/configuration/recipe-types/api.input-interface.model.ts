import { SelectItem } from 'primeng/api';
import * as _ from 'lodash';

import { RecipeTypeInputInterfaceFile } from './api.input-interface.file.model';
import { RecipeTypeInputInterfaceJson } from './api.input-interface.json.model';

export class RecipeTypeInputInterface {
    files_display: SelectItem[] = [];
    json_display: SelectItem[] = [];

    private static build(data) {
        if (data) {
            return new RecipeTypeInputInterface(
                RecipeTypeInputInterfaceFile.transformer(data.files),
                RecipeTypeInputInterfaceJson.transformer(data.json)
            );
        }
    }

    public static transformer(data) {
        if (data) {
            return RecipeTypeInputInterface.build(data);
        }
        return new RecipeTypeInputInterface([], []);
    }

    public addFile(file): object {
        if (!this.files || !Array.isArray(this.files)) {
            this.files = [];
        }
        file = _.pickBy(file, d => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const fileToAdd = RecipeTypeInputInterfaceFile.transformer(file);
        this.files.push(fileToAdd);
        this.files_display.push({
            label: JSON.stringify(file, null, 4),
            value: fileToAdd
        });
        return fileToAdd;
    }

    public removeFile(file): object {
        const fileToRemove = RecipeTypeInputInterfaceFile.transformer(file);
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
        const jsonToAdd = RecipeTypeInputInterfaceJson.transformer(json);
        this.json.push(jsonToAdd);
        this.json_display.push({
            label: JSON.stringify(json, null, 4),
            value: jsonToAdd
        });
        return jsonToAdd;
    }

    public removeJson(json): object {
        const jsonToRemove = RecipeTypeInputInterfaceJson.transformer(json);
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
                    value: RecipeTypeInputInterfaceFile.transformer(f)
                });
            });
        }

        if (this.json) {
            _.forEach(this.json, j => {
                this.json_display.push({
                    label: JSON.stringify(j, null, 4),
                    value: RecipeTypeInputInterfaceJson.transformer(j)
                });
            });
        }
    }
}
