import { Injectable } from '@angular/core';

@Injectable()
export class DashboardFavoritesService {

    constructor() {}


    addToFavorites(jobType) {
        console.log(`Adding ${jobType.id} - ${jobType.title} to favorites...`);
    }

    refreshFavorites() {
    }
}
