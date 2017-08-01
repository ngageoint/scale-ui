import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { ApiResults } from '../../api-results.model';
import { RecipesDatatableOptions } from './recipes-datatable-options.model';

@Injectable()
export class RecipeService {
    constructor(
        private http: Http
    ) { }
    getRecipes(params: RecipesDatatableOptions): Promise<ApiResults> {
        // const sortStr = params.sortOrder < 0 ? '-' + params.sortField : params.sortField;
        // const page = (params.first / params.rows) + 1;
        // return this.http.get('http://scale.dcos.aisohio.net/service/scale/api/v5/jobs/?&order=' + sortStr + '&page=' + page +
        //     '&page_size=' + params.rows + '&started=2017-07-17T00:00:00.000Zended=2017-07-24T23:59:59.999Z')
        return this.http.get('./assets/mock-recipes.json')
          .toPromise()
          .then(response => {
              let r = response.json();
              r.results = r.results.slice(params.first, params.first + params.rows);
              return r as ApiResults;
          })
          .catch(this.handleError);
    }
    getRecipe(id: number): Promise<ApiResults> {
        return this.http.get('./assets/mock-recipes.json')
          .toPromise()
          .then(response => response.json() as ApiResults)
          .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
