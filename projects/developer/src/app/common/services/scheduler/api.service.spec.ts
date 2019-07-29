import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../data.service';
import { SchedulerApiService } from './api.service';


describe('SchedulerApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, SchedulerApiService]
        });
    });

    it('should be created', inject([SchedulerApiService], (service: SchedulerApiService) => {
        expect(service).toBeTruthy();
    }));
});
