import { TestBed, inject } from '@angular/core/testing';

import { FailureRatesDatatableService } from './datatable.service';

describe('FailureRatesDatatableService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [FailureRatesDatatableService]
        });
    });

    it('should be created', inject([FailureRatesDatatableService], (service: FailureRatesDatatableService) => {
        expect(service).toBeTruthy();
    }));
});
