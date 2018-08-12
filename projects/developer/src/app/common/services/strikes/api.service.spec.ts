import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../data.service';
import { StrikesApiService } from './api.service';


describe('StrikesApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, StrikesApiService]
        });
    });

    it('should be created', inject([StrikesApiService], (service: StrikesApiService) => {
        expect(service).toBeTruthy();
    }));
});
