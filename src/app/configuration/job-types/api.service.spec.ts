import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../../common/services/data.service';
import { JobTypesApiService } from './api.service';

describe('JobTypesApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, JobTypesApiService]
        });
    });

    it('should be created', inject([JobTypesApiService], (service: JobTypesApiService) => {
        expect(service).toBeTruthy();
    }));
});
