import { TestBed, inject } from '@angular/core/testing';

import { JobTypesApiService } from './api.service';

describe('JobTypesApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [JobTypesApiService]
        });
    });

    it('should be created', inject([JobTypesApiService], (service: JobTypesApiService) => {
        expect(service).toBeTruthy();
    }));
});
