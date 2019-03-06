import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from './data.service';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, ProfileService]
        });
    });

    it('should be created', inject([ProfileService], (service: ProfileService) => {
        expect(service).toBeTruthy();
    }));
});
