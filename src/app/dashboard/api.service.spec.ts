import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { DashboardApiService } from './api.service';


describe('DashboardApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [DashboardApiService]
        });
    });

    it('should be created', inject([DashboardApiService], (service: DashboardApiService) => {
        expect(service).toBeTruthy();
    }));
});
