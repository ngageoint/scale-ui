import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from './data.service';
import { EnvironmentService } from './environment.service';

describe('EnvironmentService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, EnvironmentService]
        });
    });

    it('should be created', inject([EnvironmentService], (service: EnvironmentService) => {
        expect(service).toBeTruthy();
    }));
});
