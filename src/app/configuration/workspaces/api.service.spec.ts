import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../../common/services/data.service';
import { WorkspacesApiService } from './api.service';

describe('WorkspacesApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, WorkspacesApiService]
        });
    });

    it('should be created', inject([WorkspacesApiService], (service: WorkspacesApiService) => {
        expect(service).toBeTruthy();
    }));
});
