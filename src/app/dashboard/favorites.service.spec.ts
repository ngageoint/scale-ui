import { TestBed, inject } from '@angular/core/testing';

import { DashboardFavoritesService } from './favorites.service';

describe('DashboardFavoritesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardFavoritesService]
    });
  });

  it('should be created', inject([DashboardFavoritesService], (service: DashboardFavoritesService) => {
    expect(service).toBeTruthy();
  }));
});
