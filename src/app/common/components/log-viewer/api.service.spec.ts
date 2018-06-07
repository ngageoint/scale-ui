import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { DataService } from '../../services/data.service';
import { LogViewerApiService } from './api.service';

describe('LogViewerApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [DataService, LogViewerApiService]
        });
    });

    it('should be created', inject([LogViewerApiService], (service: LogViewerApiService) => {
        expect(service).toBeTruthy();
    }));
});
