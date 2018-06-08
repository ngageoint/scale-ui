import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../../common/services/data.service';
import { MetricsApiService } from './api.service';

describe('MetricsApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, MetricsApiService]
        });
    });

    it('should be created', inject([MetricsApiService], (service: MetricsApiService) => {
        expect(service).toBeTruthy();
    }));
});
