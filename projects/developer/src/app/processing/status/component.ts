import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { ProcessingStatusApiService } from './api.service';
import { Recipe } from '../recipes/api.model';


@Component({
    selector: 'dev-processing-status',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class ProcessingStatusComponent implements OnInit, OnDestroy {
    private static REFRESH_TIME = 10;

    private subscriptions = [];
    public recipes = [];

    constructor(
        private api: ProcessingStatusApiService
    ) {
    }

    ngOnInit() {
        // create timer to periodically refresh recipe data
        const timer = Observable.timer(0, ProcessingStatusComponent.REFRESH_TIME * 1500);
        this.subscriptions.push(
            timer.subscribe(() => {
                this.api.getRecipes().subscribe(data => {
                    this.recipes = data.results as Recipe[];
                });
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
     * Loop trackBy function to prevent recreating new components.
     * @param  index index of the loop
     * @param  item  recipe object
     * @return       the id of the recipe
     */
    public recipeTrackBy(index: number, item: any): number {
        return item.id;
    }
}
