import { TestBed, inject } from '@angular/core/testing';

import { RecipesApiService } from './api.service';

describe('RecipesApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [RecipesApiService]
        });
    });

    it('should be created', inject([RecipesApiService], (service: RecipesApiService) => {
        expect(service).toBeTruthy();
    }));
});
