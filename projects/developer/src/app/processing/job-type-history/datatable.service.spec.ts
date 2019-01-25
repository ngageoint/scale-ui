import { TestBed, inject } from '@angular/core/testing';

import { JobTypeHistoryDatatableService } from './datatable.service';

describe('FailureRatesDatatableService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [JobTypeHistoryDatatableService]
        });
    });

    it('should be created', inject([JobTypeHistoryDatatableService], (service: JobTypeHistoryDatatableService) => {
        expect(service).toBeTruthy();
    }));
});
