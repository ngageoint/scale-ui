import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import { DashboardApiService } from './api.service';
import { DashboardFavoritesService } from './favorites.service';


@Component({
    selector: 'app-dashboard',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class DashboardComponent implements OnInit {

    private allJobTypes: any[];
    private favoriteJobTypes: any[];

    constructor(
        private apiService: DashboardApiService,
        private favoritesService: DashboardFavoritesService
    ) {
        this.allJobTypes = [];
        this.favoriteJobTypes = [];
    }

    ngOnInit() {
        this.refreshAllJobTypes();
        this.favoritesService.favoritesUpdated.subscribe(
            (lang) => {
                this.refreshAllJobTypes();
            }
        );
    }

    private refreshAllJobTypes() {
        this.apiService.getJobTypesAndStatus().then(data => {
            this.allJobTypes = data.results as any[];
            const favs = [];
            this.allJobTypes.forEach(jt => {
                if (this.favoritesService.isFavorite(jt.job_type.id)) {
                    favs.push(jt);
                }
            });
            this.favoriteJobTypes = favs;
        });
    }
}
