import { TestBed, inject } from '@angular/core/testing';

import { IngestDatatableService } from './datatable.service';

describe('IngestDatatableService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [IngestDatatableService]
        });
    });

    it('should be created', inject([IngestDatatableService], (service: IngestDatatableService) => {
        expect(service).toBeTruthy();
    }));
});
