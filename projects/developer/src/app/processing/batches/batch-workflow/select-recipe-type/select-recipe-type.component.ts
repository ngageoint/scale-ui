import { RecipeTypesApiService } from './../../../../configuration/recipe-types/api.service';
import { SelectItem } from 'primeng/primeng';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { RecipeType } from 'projects/developer/src/app/configuration/recipe-types/api.model';
import * as _ from 'lodash';

@Component({
    selector: 'dev-select-recipe-type',
    templateUrl: './select-recipe-type.component.html',
    styleUrls: ['./select-recipe-type.component.scss']
})
export class SelectRecipeTypeComponent implements OnInit {
    recipeTypeOptions: SelectItem[] = [];
    selectedRecipeType: any;
    loading: boolean;
    @Output() valueChange = new EventEmitter();

    constructor(
        private recipeTypesApiService: RecipeTypesApiService
    ) {}

    ngOnInit() {
        this.getRecipeTypes();
    }

    onSelectedRecipeTypeChange(event) {
        this.valueChange.emit(event.value);
    }

    getRecipeTypes() {
        this.recipeTypesApiService.getRecipeTypes({rows: 100000}).subscribe(data => {
            const recipeTypes = RecipeType.transformer(data.results);
            _.forEach(recipeTypes, (rt: any) => {
                this.recipeTypeOptions.push({
                    label: rt.title,
                    value: rt
                });
            });
            this.recipeTypeOptions = _.orderBy(this.recipeTypeOptions, ['title'], ['asc']);
        }, err => {
            console.log('Error retrieving recipe types: ' + err);
        });
    }
}
