import { TestBed, inject } from '@angular/core/testing';

import { BatchesDatatableService } from './datatable.service';

describe('BatchesDatatableService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BatchesDatatableService]
        });
    });

    it('should be created', inject([BatchesDatatableService], (service: BatchesDatatableService) => {
        expect(service).toBeTruthy();
    }));
});
