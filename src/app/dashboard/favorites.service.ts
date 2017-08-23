import { EventEmitter, Injectable, Output } from '@angular/core';


@Injectable()
export class DashboardFavoritesService {

    private FAVORITES_KEY = 'scale.dashboard.favorites';
    public favorites: number[] = [];

    @Output() favoritesUpdated = new EventEmitter();
    constructor() {
        this.refreshFavorites();
    }

    isFavorite(jobTypeId) {
        if (this.favorites.indexOf(jobTypeId) < 0) {
            return false;
        }
        return true;
    }

    toggleFavorite(jobType) {
        const idx = this.favorites.indexOf(jobType.id);
        if (idx > -1) {
            // remove it
            this.favorites.splice(idx, 1);
        } else {
            // add it
            this.favorites.push(jobType.id);
        }
        this.favoritesUpdated.emit();
        this.saveFavorites();
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
}
