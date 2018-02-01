import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { SelectItem } from 'primeng/primeng';
import * as _ from 'lodash';

import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

import { RecipeTypesApiService } from './api.service';
import { JobTypesApiService } from '../job-types/api.service';
import { DataService } from '../../data.service';
import { RecipeType } from './api.model';
import { JobType } from '../job-types/api.model';

@Component({
    selector: 'app-job-types',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class RecipeTypesComponent implements OnInit, OnDestroy {
    private routerEvents: any;
    private routeParams: any;
    jobTypes: any;
    recipeTypes: SelectItem[];
    selectedRecipeType: SelectItem;
    selectedRecipeTypeDetail: any;
    selectedJobType: JobType;
    addJobTypeDisplay: boolean;
    scrollHeight: any;

    constructor(
        private recipeTypesApiService: RecipeTypesApiService,
        private jobTypesApiService: JobTypesApiService,
        private dataService: DataService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        if (this.router.events) {
            this.routerEvents = this.router.events
                .filter((event) => event instanceof NavigationEnd)
                .map(() => this.route)
                .subscribe(() => {
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
                });
        }
    }

    private getRecipeTypeDetail(id: number) {
        this.recipeTypesApiService.getRecipeType(id).then(data => {
            this.selectedRecipeTypeDetail = RecipeType.transformer(data);
        });
    }

    showAddJobType() {
        this.addJobTypeDisplay = true;
    }

    getUnicode(code) {
        return `&#x${code};`;
    }
    onRowSelect(e) {
        this.router.navigate([`/configuration/recipe-types/${e.value.id}`]);
    }
    ngOnInit() {
        this.scrollHeight = this.dataService.getViewportSize().height * 0.85;
        this.jobTypesApiService.getJobTypes().then(data => {
            this.jobTypes = data.results;
        });
    }
    ngOnDestroy() {
        this.routerEvents.unsubscribe();
        this.routeParams.unsubscribe();
    }
}
