import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { DataService } from '../../data.service';
import { WorkspacesApiService } from './api.service';

describe('WorkspacesApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [DataService, WorkspacesApiService]
        });
    });

    it('should be created', inject([WorkspacesApiService], (service: WorkspacesApiService) => {
        expect(service).toBeTruthy();
    }));
});
