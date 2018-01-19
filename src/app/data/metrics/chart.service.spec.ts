import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { ColorService } from '../../color.service';
import { ChartService } from './chart.service';

describe('ChartService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [ColorService, ChartService]
        });
    });

    it('should be created', inject([ChartService], (service: ChartService) => {
        expect(service).toBeTruthy();
    }));
});
