import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { WorkspacesApiService } from './api.service';

describe('WorkspacesApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [WorkspacesApiService]
        });
    });

    it('should be created', inject([WorkspacesApiService], (service: WorkspacesApiService) => {
        expect(service).toBeTruthy();
    }));
});
