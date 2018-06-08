import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../../services/data.service';
import { ScansApiService } from './api.service';


describe('ScansApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, ScansApiService]
        });
    });

    it('should be created', inject([ScansApiService], (service: ScansApiService) => {
        expect(service).toBeTruthy();
    }));
});
