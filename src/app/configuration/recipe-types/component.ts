import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { SelectItem } from 'primeng/primeng';
import * as _ from 'lodash';

import { RecipeTypesApiService } from './api.service';
import { RecipeType } from './api.model';
import { JobType } from '../job-types/api.model';

@Component({
    selector: 'app-job-types',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class RecipeTypesComponent implements OnInit, OnDestroy {
    private routeParams: any;
    recipeTypes: SelectItem[];
    selectedRecipeType: SelectItem;
    selectedRecipeTypeDetail: any;
    selectedJobType: JobType;

    constructor(
        private recipeTypesApiService: RecipeTypesApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        if (this.router.events) {
            this.router.events.subscribe(currentRoute => {
                if (currentRoute instanceof NavigationEnd) {
                    this.recipeTypes = [];
                    let id = null;
                    if (this.route && this.route.paramMap) {
                        this.routeParams = this.route.paramMap.subscribe(params => {
                            id = +params.get('id');
                        });
                    }
                    this.recipeTypesApiService.getRecipeTypes().then(data => {
                        _.forEach(data.results, (result) => {
                            this.recipeTypes.push({
                                label: result.title + ' ' + result.version,
                                value: result
                            });
                            if (id === result.id) {
                                this.selectedRecipeType = _.clone(result);
                            }
                        });
                        if (id) {
                            this.getRecipeTypeDetail(id);
                        }
                    });
                }
            });
        }
    }

    private getRecipeTypeDetail(id: number) {
        this.recipeTypesApiService.getRecipeType(id).then(data => {
            this.selectedRecipeTypeDetail = RecipeType.transformer(data);
        });
    }

    getUnicode(code) {
        return `&#x${code};`;
    }
    onRowSelect(e) {
        this.router.navigate([`/configuration/recipe-types/${e.value.id}`]);
    }
    ngOnInit() {
    }
    ngOnDestroy() {

    }
}
