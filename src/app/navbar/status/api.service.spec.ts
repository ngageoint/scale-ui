import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { DataService } from '../../data.service';
import { StatusApiService } from './api.service';

describe('StatusApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [DataService, StatusApiService]
        });
    });

    it('should be created', inject([StatusApiService], (service: StatusApiService) => {
        expect(service).toBeTruthy();
    }));
});
