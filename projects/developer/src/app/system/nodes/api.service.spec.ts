import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../../common/services/data.service';
import { NodesApiService } from './api.service';

describe('IngestApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, NodesApiService]
        });
    });

    it('should be created', inject([NodesApiService], (service: NodesApiService) => {
        expect(service).toBeTruthy();
    }));
});
