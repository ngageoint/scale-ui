import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent } from 'primeng/primeng';
import { TreeNode } from 'primeng/primeng';
import * as _ from 'lodash';

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
    recipeTypeData: TreeNode[];
    selectedRecipeType: RecipeType;
    selectedRecipeTypeKeys: string[];
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
        this.router.navigate(['/configuration/recipe-types'], {
            queryParams: this.datatableOptions
        });

        this.updateData();
    }
    private getRecipeTypeDetail(id: number) {
        this.recipeTypesApiService.getRecipeType(id).then(data => {
            this.selectedRecipeType = data as RecipeType;
            this.selectedRecipeTypeKeys = Object.keys(this.selectedRecipeType);

            this.recipeTypeData = [{
                label: 'Start',
                expanded: true,
                children: []
            }];

            _.forEach(this.selectedRecipeType.definition.jobs, (job) => {
                if (job.dependencies.length === 0) {
                    this.recipeTypeData[0].children.push({
                        label: job.name,
                        expanded: true,
                        children: []
                    });
                } else {
                    // recursively find parent jobs
                    const filter = (collection, dependencyName, jobName) => {
                        _.forEach(collection, (item) => {
                            if (item.label === dependencyName) {
                                item.children.push({
                                    label: jobName,
                                    expanded: true,
                                    children: []
                                 });
                                return false;
                            } else {
                                filter(item.children, dependencyName, jobName);
                            }
                        });
                    };
                    _.forEach(job.dependencies, (dependency) => {
                        filter(this.recipeTypeData[0].children, dependency.name, job.name);
                    });
                }
            });
        });
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
    onRowSelect(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            id: e.data.id
        });
        this.recipeTypesDatatableService.setRecipeTypesDatatableOptions(this.datatableOptions);
        this.router.navigate(['/configuration/recipe-types'], {
            queryParams: this.datatableOptions
        });
        this.getRecipeTypeDetail(e.data.id);
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
                id: params.id,
                started: params.started,
                ended: params.ended
            };
        } else {
            this.datatableOptions = this.recipeTypesDatatableService.getRecipeTypesDatatableOptions();
        }
        this.updateOptions();
        if (this.datatableOptions.id) {
            this.getRecipeTypeDetail(this.datatableOptions.id);
        }
    }
}
