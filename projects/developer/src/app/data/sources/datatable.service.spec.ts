import { TestBed, inject } from '@angular/core/testing';

import { SourcesDatatableService } from './datatable.service';

describe('SourcesDatatableService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SourcesDatatableService]
        });
    });

    it('should be created', inject([SourcesDatatableService], (service: SourcesDatatableService) => {
        expect(service).toBeTruthy();
    }));
});
