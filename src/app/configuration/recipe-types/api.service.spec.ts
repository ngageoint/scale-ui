import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../../common/services/data.service';
import { RecipeTypesApiService } from './api.service';

describe('ApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, RecipeTypesApiService]
        });
    });

    it('should be created', inject([RecipeTypesApiService], (service: RecipeTypesApiService) => {
        expect(service).toBeTruthy();
    }));
});
