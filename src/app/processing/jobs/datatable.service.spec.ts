import { TestBed, inject } from '@angular/core/testing';

import { JobsDatatableService } from './datatable.service';

describe('JobsDatatableService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [JobsDatatableService]
        });
    });

    it('should be created', inject([JobsDatatableService], (service: JobsDatatableService) => {
        expect(service).toBeTruthy();
    }));
});
