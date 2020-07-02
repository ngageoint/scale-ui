import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../../common/services/data.service';
import { TimelineApiService } from './timeline.api.service';

describe('TimelineApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, TimelineApiService]
        });
    });

    it('should be created', inject([TimelineApiService], (service: TimelineApiService) => {
        expect(service).toBeTruthy();
    }));
});
