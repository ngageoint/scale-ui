import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../../services/data.service';
import { LogViewerApiService } from './api.service';

describe('LogViewerApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, LogViewerApiService]
        });
    });

    it('should be created', inject([LogViewerApiService], (service: LogViewerApiService) => {
        expect(service).toBeTruthy();
    }));
});
