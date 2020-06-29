import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SelectItem } from 'primeng/api';

import { LocalStorageItem } from '../../common/utils/localstorage';
import { ProcessingStatusApiService } from './api.service';
import { Recipe } from '../recipes/api.model';
import { RecipeType } from '../../configuration/recipe-types/api.model';


@Component({
    selector: 'dev-processing-status',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class ProcessingStatusComponent implements OnInit, OnDestroy {
    // how often the component should refresh data
    private static REFRESH_TIME = 10;

    public timer: Observable<number>;
    // filtered recipes from the api
    public recipes = [];
    // recipe types to show in the select dropdown
    public recipeTypes: SelectItem[] = [];
    // recipe types selected in the dropdown component
    public selectedRecipeTypes: number[] = [];
    // storage for saving the selected recipe types
    private _selectedRecipeTypesStorage = new LocalStorageItem('recipe-types', 'processing-status');
    // all subscriptions in this component
    private subscriptions = [];

    /**
     * Getter to alias the local storage item.
     * @return list of recipe type ids from local storage
     */
    public get selectedRecipeTypesStorage(): number[] {
        return this._selectedRecipeTypesStorage.get() || [];
    }

    /**
     * Setter to alias the local storage item.
     * @param  values list of recipe type ids to set in local storage
     */
    public set selectedRecipeTypesStorage(values: number[]) {
        this._selectedRecipeTypesStorage.set(values);
    }

    constructor(
        private api: ProcessingStatusApiService
    ) {
        this.selectedRecipeTypes = this.selectedRecipeTypesStorage;
    }

    ngOnInit() {
        // get available recipe types and create dropdown menu options
        this.subscriptions.push(
            this.api.getRecipeTypes().subscribe(data => {
                this.recipeTypes = (data.results as RecipeType[]).map(r => {
                    return {
                        label: `${r.title} rev. ${r.revision_num}`,
                        value: r.id,
                    };
                });
            })
        );

        // create timer to periodically refresh recipe data
        // this will be shared with child recipe component to also update job data
        this.timer = Observable.timer(0, ProcessingStatusComponent.REFRESH_TIME * 1500);
        this.subscriptions.push(
            this.timer.subscribe(() => {
                this.fetch();
            })
        );
    }

    ngOnDestroy() {
        this.unsubscribe();
    }

    /**
     * Unsubscribe from all subscriptions
     */
    private unsubscribe(): void {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.subscriptions = [];
    }

    /**
     * Fetches recipe data from the api if recipe types are selected.
     */
    private fetch(): void {
        if (this.selectedRecipeTypes && this.selectedRecipeTypes.length) {
            this.api.getRecipes(this.selectedRecipeTypes).subscribe(data => {
                this.recipes = data.results as Recipe[];
            });
        } else {
            // no recipe types selected, ensure recipes have been cleared
            this.recipes = [];
        }
    }

    /**
     * Loop trackBy function to prevent recreating new components.
     * @param  index index of the loop
     * @param  item  recipe object
     * @return       the id of the recipe
     */
    public recipeTrackBy(index: number, item: any): number {
        return item.id;
    }

    /**
     * Callback when recipe types dropdown is closed. Allows for batch selecting multiple recipe
     * types only when the dropdown is closed, instead of using onchange for each selection.
     */
    public onRecipeTypeHide(): void {
        // save the selected values to storage and refresh the data
        this.selectedRecipeTypesStorage = this.selectedRecipeTypes;
        this.fetch();
    }
}
