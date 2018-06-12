import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../../common/services/data.service';
import { SourcesApiService } from './api.service';


describe('SourcesApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, SourcesApiService]
        });
    });

    it('should be created', inject([SourcesApiService], (service: SourcesApiService) => {
        expect(service).toBeTruthy();
    }));
});
