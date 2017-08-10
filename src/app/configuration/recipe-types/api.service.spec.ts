import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { RecipeTypesApiService } from './api.service';

describe('ApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [RecipeTypesApiService]
        });
    });

    it('should be created', inject([RecipeTypesApiService], (service: RecipeTypesApiService) => {
        expect(service).toBeTruthy();
    }));
});
