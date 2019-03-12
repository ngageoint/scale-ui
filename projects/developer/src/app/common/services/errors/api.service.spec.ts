import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../data.service';
import { ErrorsApiService } from './api.service';

describe('ErrorsApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, ErrorsApiService]
        });
    });

    it('should be created', inject([ErrorsApiService], (service: ErrorsApiService) => {
        expect(service).toBeTruthy();
    }));
});
