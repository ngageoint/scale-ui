import { TestBed, inject } from '@angular/core/testing';

import { JobsApiService } from './api.service';

describe('JobsApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [JobsApiService]
        });
    });

    it('should be created', inject([JobsApiService], (service: JobsApiService) => {
        expect(service).toBeTruthy();
    }));
});
