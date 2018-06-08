import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../../common/services/data.service';
import { StatusApiService } from './api.service';

describe('StatusApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, StatusApiService]
        });
    });

    it('should be created', inject([StatusApiService], (service: StatusApiService) => {
        expect(service).toBeTruthy();
    }));
});
