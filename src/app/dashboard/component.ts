import { Component, OnDestroy, OnInit } from '@angular/core';

import { JobTypesApiService } from '../configuration/job-types/api.service';
import { DashboardFavoritesService } from './favorites.service';


@Component({
    selector: 'app-dashboard',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
    subscription: any;
    private allJobTypes: any[];
    private favoriteJobTypes: any[];

    constructor(
        private jobTypesApiService: JobTypesApiService,
        private favoritesService: DashboardFavoritesService
    ) {
        this.allJobTypes = [];
        this.favoriteJobTypes = [];
    }

    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
    ngOnInit() {
        this.refreshAllJobTypes();
        this.favoritesService.favoritesUpdated.subscribe(() => {
            this.refreshAllJobTypes();
        });
    }
    ngOnDestroy() {
        this.unsubscribe();
    }

    private refreshAllJobTypes() {
        this.unsubscribe();
        this.subscription = this.jobTypesApiService.getJobTypeStatus(true).subscribe(data => {
            this.allJobTypes = data.results;
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

