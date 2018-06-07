import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { DataService } from '../../common/services/data.service';
import { MetricsApiService } from './api.service';

describe('MetricsApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [DataService, MetricsApiService]
        });
    });

    it('should be created', inject([MetricsApiService], (service: MetricsApiService) => {
        expect(service).toBeTruthy();
    }));
});
