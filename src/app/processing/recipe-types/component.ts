import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent } from 'primeng/primeng';

import { RecipeTypesApiService } from './api.service';
import { RecipeType } from './api.model';
import { RecipeTypesDatatable } from './datatable.model';
import { RecipeTypesDatatableService } from './datatable.service';

@Component({
    selector: 'app-job-types',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class RecipeTypesComponent implements OnInit {
    datatableOptions: RecipeTypesDatatable;
    recipeTypes: RecipeType[];
    first: number;
    count: number;
    isInitialized: boolean;

    constructor(
        private recipeTypesDatatableService: RecipeTypesDatatableService,
        private recipeTypesApiService: RecipeTypesApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.isInitialized = false;
    }

    private updateData() {
        this.recipeTypesApiService.getRecipeTypes(this.datatableOptions).then(data => {
            this.count = data.count;
            this.recipeTypes = data.results as RecipeType[];
        });
    }
    private updateOptions() {
        this.recipeTypesDatatableService.setRecipeTypesDatatableOptions(this.datatableOptions);

        // update querystring
        this.router.navigate(['/processing/recipe-types'], {
            queryParams: this.datatableOptions
        });

        this.updateData();
    }

    paginate(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: e.first,
            rows: parseInt(e.rows, 10)
        });
        this.updateOptions();
    }
    onLazyLoad(e: LazyLoadEvent) {
        // let ngOnInit handle loading data to ensure query params are respected
        if (this.isInitialized) {
            this.datatableOptions = Object.assign(this.datatableOptions, {
                first: 0,
                sortField: e.sortField,
                sortOrder: e.sortOrder
            });
            this.updateOptions();
        } else {
            // data was just loaded by ngOnInit, so set flag to true
            this.isInitialized = true;
        }
    }
    ngOnInit() {
        if (this.route.snapshot &&
            Object.keys(this.route.snapshot.queryParams).length > 0) {

            const params = this.route.snapshot.queryParams;
            this.datatableOptions = {
                first: parseInt(params.first, 10),
                rows: parseInt(params.rows, 10),
                sortField: params.sortField,
                sortOrder: parseInt(params.sortOrder, 10),
                started: params.started,
                ended: params.ended
            };
        } else {
            this.datatableOptions = this.recipeTypesDatatableService.getRecipeTypesDatatableOptions();
        }
        this.updateOptions();
    }
}
