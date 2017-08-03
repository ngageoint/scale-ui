import { TestBed, inject } from '@angular/core/testing';

import { DashboardApiService } from './api.service';

describe('DashboardApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DashboardApiService]
        });
    });

    it('should be created', inject([DashboardApiService], (service: DashboardApiService) => {
        expect(service).toBeTruthy();
    }));
});
