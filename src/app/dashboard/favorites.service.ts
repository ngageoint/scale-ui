import { Injectable } from '@angular/core';

@Injectable()
export class DashboardFavoritesService {

    private FAVORITES_KEY = 'scale.dashboard.favorites';
    private favorites: number[];

    constructor() {
        this.favorites = [];
        this.refreshFavorites();
    }

    isFavorite(jobTypeId) {
        if (this.favorites.indexOf(jobTypeId) < 0) {
            return false;
        }
        return true;
    }

    toggleFavorite(jobType) {
        console.log(`Adding ${jobType.id} - ${jobType.title} to favorites...`);
        const idx = this.favorites.indexOf(jobType.id);
        if (idx > -1) {
            // remove it
            this.favorites.splice(idx, 1);
        } else {
            // add it
            this.favorites.push(jobType.id);
        }
        console.log('Favorites: ' + JSON.stringify(this.favorites));
        this.saveFavorites();
    }

    refreshFavorites() {
    }

    saveFavorites() {
        localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(this.favorites));
    }
}
