import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../../common/services/data.service';
import { IngestApiService } from './api.service';

describe('IngestApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, IngestApiService]
        });
    });

    it('should be created', inject([IngestApiService], (service: IngestApiService) => {
        expect(service).toBeTruthy();
    }));
});
