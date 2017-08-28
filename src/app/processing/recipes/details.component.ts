import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Recipe } from './api.model';
import { RecipesApiService } from './api.service';

@Component({
    selector: 'app-recipe-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class RecipeDetailsComponent implements OnInit {
    recipe: Recipe;
    recipeKeys: string[];
    constructor(
        private route: ActivatedRoute,
        private recipesApiService: RecipesApiService
    ) { }

    ngOnInit() {
        if (this.route.snapshot) {
            const id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
            this.recipesApiService.getRecipe(id).then(data => {
                this.recipe = data as Recipe;
                this.recipeKeys = Object.keys(this.recipe);
            });
        }
    }
}
