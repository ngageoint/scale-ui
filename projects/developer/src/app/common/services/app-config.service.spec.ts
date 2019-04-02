import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AppConfigService]
        });
    });

    it('should be created', inject([AppConfigService], (service: AppConfigService) => {
        expect(service).toBeTruthy();
    }));
});
