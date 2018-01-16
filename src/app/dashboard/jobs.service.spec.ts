import { TestBed, inject } from '@angular/core/testing';

import { DashboardJobsService } from './jobs.service';

describe('DashboardJobsService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DashboardJobsService]
        });
    });

    it('should be created', inject([DashboardJobsService], (service: DashboardJobsService) => {
        expect(service).toBeTruthy();
    }));
});
