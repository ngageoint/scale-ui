import { EventEmitter, Injectable, Output } from '@angular/core';
import * as _ from 'lodash';

@Injectable()
export class DashboardJobsService {
    private FAVORITES_KEY = 'scale.dashboard.favorites';
    favorites = [];
    activeJobs = [];

    @Output() favoritesUpdated = new EventEmitter();
    constructor() {
        this.refreshFavorites();
    }

    isFavorite(jobType) {
        return _.find(this.favorites, jobType);
    }

    toggleFavorite(jobType) {
        if (_.find(this.favorites, jobType)) {
            // remove it
            _.remove(this.favorites, jobType);
        } else {
            // add it
            this.favorites.push(jobType);
        }
        this.favoritesUpdated.emit();
        this.saveFavorites();
    }

    getFavorites() {
        return this.favorites;
    }

    refreshFavorites() {
        const val = localStorage.getItem(this.FAVORITES_KEY);
        if (val) {
            this.favorites = JSON.parse(val);
        }
    }

    saveFavorites() {
        localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(this.favorites));
    }

    getActiveJobs() {
        return this.activeJobs;
    }

    setActiveJobs(data) {
        this.activeJobs = data;
    }
}
