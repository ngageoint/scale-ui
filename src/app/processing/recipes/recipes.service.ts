import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Recipe } from './recipe.model';

@Injectable()
export class RecipeService {
    constructor(
        private http: Http
    ) { }
    getRecipes(params: object): Promise<Recipe[]> {
        // let sortStr = sortOrder < 0 ? '-' + sortField : sortField;
        // return this.http.get('http://scale.dcos.aisohio.net/service/scale/api/v5/jobs/?ended=2017-07-24T23:59:59.999Z&order=' +
        //         sortStr +
        //         '&page=1&page_size=25&started=2017-07-17T00:00:00.000Z')
        return this.http.get('./assets/mock-recipes.json')
          .toPromise()
          .then(response => response.json().results as Recipe[])
          .catch(this.handleError);
    }
    getRecipe(id: number): Promise<Recipe[]> {
        return this.http.get('./assets/mock-recipes.json')
          .toPromise()
          .then(response => response.json().results as Recipe[])
          .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
