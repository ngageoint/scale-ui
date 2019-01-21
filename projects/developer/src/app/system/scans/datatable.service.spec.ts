import { TestBed, inject } from '@angular/core/testing';

import { ScansDatatableService } from './datatable.service';

describe('ScansDatatableService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ScansDatatableService]
        });
    });

    it('should be created', inject([ScansDatatableService], (service: ScansDatatableService) => {
        expect(service).toBeTruthy();
    }));
});
