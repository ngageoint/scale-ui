import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { SourceFilesApiService } from './api.service';


describe('JobsApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [SourceFilesApiService]
        });
    });

    it('should be created', inject([SourceFilesApiService], (service: SourceFilesApiService) => {
        expect(service).toBeTruthy();
    }));
});
