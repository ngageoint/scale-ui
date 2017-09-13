import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { RunningJobsApiService } from './api.service';


describe('RunningJobsApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [RunningJobsApiService]
        });
    });

    it('should be created', inject([RunningJobsApiService], (service: RunningJobsApiService) => {
        expect(service).toBeTruthy();
    }));
});
