import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { DataService } from '../../services/data.service';
import { ScansApiService } from './api.service';


describe('ScansApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [DataService, ScansApiService]
        });
    });

    it('should be created', inject([ScansApiService], (service: ScansApiService) => {
        expect(service).toBeTruthy();
    }));
});
