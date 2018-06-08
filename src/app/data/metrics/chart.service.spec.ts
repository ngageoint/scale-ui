import { TestBed, inject } from '@angular/core/testing';

import { ColorService } from '../../common/services/color.service';
import { ChartService } from './chart.service';

describe('ChartService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ColorService, ChartService]
        });
    });

    it('should be created', inject([ChartService], (service: ChartService) => {
        expect(service).toBeTruthy();
    }));
});
