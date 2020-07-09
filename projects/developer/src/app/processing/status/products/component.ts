import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';

import { Recipe } from '../../recipes/api.model';
import { ProcessingStatusApiService } from '../api.service';

@Component({
    selector: 'dev-processing-status-products',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class ProcessingStatusProductsComponent implements OnInit, OnDestroy {
    @Input() recipe: Recipe;

    // whether or not the modal is visible
    public isVisible = false;
    // products fetched from the api
    public products: any = [];
    // number of products per page in the table
    public perPage = 25;
    // total number fetched from api
    public total = 0;
    // whether or not the products are loading
    public isLoading = false;

    private subscriptions = [];


    constructor(
        private api: ProcessingStatusApiService
    ) {
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.unsubscribe();
    }

    /**
     * Unsubscribe from all subscriptions.
     */
    private unsubscribe(): void {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.subscriptions = [];
    }

    /**
     * On hide of the modal, unsubscribe from everything and clear any data.
     */
    public onHide(): void {
        this.unsubscribe();
        this.products = [];
    }

    /**
     * Fetch the products data on lazy load callback of the table.
     * @param e lazy load callback event data
     */
    public fetch(e: LazyLoadEvent): void {
        this.isLoading = true;

        const params = {
            page_size: e.rows,
            page: (e.first / e.rows) + 1
        };

        this.subscriptions.push(
            this.api.getProductsForRecipe(this.recipe.id, params).subscribe(results => {
                this.isLoading = false;
                this.total = results.count;
                this.products = results.results;

                // used to force a redraw of the modal
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                });
            })
        );
    }

}
