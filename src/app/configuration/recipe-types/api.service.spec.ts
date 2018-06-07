import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { DataService } from '../../common/services/data.service';
import { RecipeTypesApiService } from './api.service';

describe('ApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [DataService, RecipeTypesApiService]
        });
    });

    it('should be created', inject([RecipeTypesApiService], (service: RecipeTypesApiService) => {
        expect(service).toBeTruthy();
    }));
});
