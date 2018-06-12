import { TestBed, inject } from '@angular/core/testing';

import { RunningJobsDatatableService } from './datatable.service';

describe('JobsDatatableService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [RunningJobsDatatableService]
        });
    });

    it('should be created', inject([RunningJobsDatatableService], (service: RunningJobsDatatableService) => {
        expect(service).toBeTruthy();
    }));
});
