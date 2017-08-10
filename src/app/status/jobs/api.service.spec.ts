import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { JobsApiService } from './api.service';


describe('JobsApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [JobsApiService]
        });
    });

    it('should be created', inject([JobsApiService], (service: JobsApiService) => {
        expect(service).toBeTruthy();
    }));
});
