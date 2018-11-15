import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../data.service';
import { FilesApiService } from './api.service';


describe('FilesApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, FilesApiService]
        });
    });

    it('should be created', inject([FilesApiService], (service: FilesApiService) => {
        expect(service).toBeTruthy();
    }));
});
