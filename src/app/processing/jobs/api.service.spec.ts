import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../../common/services/data.service';
import { JobsApiService } from './api.service';


describe('JobsApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, JobsApiService]
        });
    });

    it('should be created', inject([JobsApiService], (service: JobsApiService) => {
        expect(service).toBeTruthy();
    }));
});
