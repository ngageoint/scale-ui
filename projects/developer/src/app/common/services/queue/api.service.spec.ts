import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../data.service';
import { QueueApiService } from './api.service';


describe('QueueApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, QueueApiService]
        });
    });

    it('should be created', inject([QueueApiService], (service: QueueApiService) => {
        expect(service).toBeTruthy();
    }));
});
