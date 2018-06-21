import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../../common/services/data.service';
import { BatchesApiService } from './api.service';


describe('BatchesApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, BatchesApiService]
        });
    });

    it('should be created', inject([BatchesApiService], (service: BatchesApiService) => {
        expect(service).toBeTruthy();
    }));
});
