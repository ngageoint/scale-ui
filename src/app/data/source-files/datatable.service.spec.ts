import { TestBed, inject } from '@angular/core/testing';

import { SourceFilesDatatableService } from './datatable.service';

describe('SourceFilesDatatableService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SourceFilesDatatableService]
        });
    });

    it('should be created', inject([SourceFilesDatatableService], (service: SourceFilesDatatableService) => {
        expect(service).toBeTruthy();
    }));
});
