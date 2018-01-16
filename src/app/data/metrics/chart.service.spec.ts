import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { ChartService } from './chart.service';

describe('ChartService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [ChartService]
        });
    });

    it('should be created', inject([ChartService], (service: ChartService) => {
        expect(service).toBeTruthy();
    }));
});
