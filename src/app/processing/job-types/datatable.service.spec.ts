import { TestBed, inject } from '@angular/core/testing';

import { JobTypesDatatableService } from './datatable.service';

describe('JobTypesDatatableService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [JobTypesDatatableService]
        });
    });

    it('should be created', inject([JobTypesDatatableService], (service: JobTypesDatatableService) => {
        expect(service).toBeTruthy();
    }));
});
