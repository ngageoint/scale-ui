import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { SourcesApiService } from './api.service';


describe('SourcesApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [SourcesApiService]
        });
    });

    it('should be created', inject([SourcesApiService], (service: SourcesApiService) => {
        expect(service).toBeTruthy();
    }));
});
