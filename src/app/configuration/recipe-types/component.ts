import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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

export class RecipeTypesComponent implements OnInit {
    recipeTypes: SelectItem[];
    selectedRecipeType: SelectItem;
    selectedRecipeTypeDetail: any;
    selectedJobType: JobType;

    constructor(
        private recipeTypesApiService: RecipeTypesApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    private getRecipeTypeDetail(id: number) {
        this.recipeTypesApiService.getRecipeType(id).then(data => {
            this.selectedRecipeTypeDetail = RecipeType.transformer(data);
        });
    }

    getUnicode(code) {
        return `&#x${code};`;
    }
    onRowSelect(e) {
        this.router.navigate(['/configuration/recipe-types'], {
            queryParams: {
                id: e.value.id,
            },
            replaceUrl: true
        });
        this.getRecipeTypeDetail(e.value.id);
    }
    ngOnInit() {
        this.recipeTypes = [];
        const params = this.route.snapshot ? this.route.snapshot.queryParams : { id: null };
        this.recipeTypesApiService.getRecipeTypes().then(data => {
            _.forEach(data.results, (result) => {
                this.recipeTypes.push({
                    label: result.title + ' ' + result.version,
                    value: result
                });
                if (params.id && parseInt(params.id, 10) === result.id) {
                    this.selectedRecipeType = _.clone(result);
                }
            });
            if (params.id) {
                this.getRecipeTypeDetail(params.id);
            }
        });
    }
}
