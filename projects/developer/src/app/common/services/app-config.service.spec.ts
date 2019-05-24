import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AppConfigService } from './app-config.service';
import { THEMES, ACTIVE_THEME } from '../../theme/symbols';

describe('AppConfigService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                AppConfigService,
                { provide: THEMES, useValue: THEMES },
                { provide: ACTIVE_THEME, useValue: ACTIVE_THEME }
            ]
        });
    });

    it('should be created', inject([AppConfigService], (service: AppConfigService) => {
        expect(service).toBeTruthy();
    }));
});
