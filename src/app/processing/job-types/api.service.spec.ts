import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { JobTypesApiService } from './api.service';


describe('JobTypesApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [JobTypesApiService]
        });
    });

    it('should be created', inject([JobTypesApiService], (service: JobTypesApiService) => {
        expect(service).toBeTruthy();
    }));
});
