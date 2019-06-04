import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../../common/services/data.service';
import { VersionService } from './version.service';


describe('VersionService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, VersionService]
        });
    });

    it('should be created', inject([VersionService], (service: VersionService) => {
        expect(service).toBeTruthy();
    }));
});
