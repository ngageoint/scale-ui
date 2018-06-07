import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { DataService } from '../../common/services/data.service';
import { JobsApiService } from './api.service';


describe('JobsApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [DataService, JobsApiService]
        });
    });

    it('should be created', inject([JobsApiService], (service: JobsApiService) => {
        expect(service).toBeTruthy();
    }));
});
