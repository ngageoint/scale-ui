import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { RecipesApiService } from './api.service';


describe('RecipesApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [RecipesApiService]
        });
    });

    it('should be created', inject([RecipesApiService], (service: RecipesApiService) => {
        expect(service).toBeTruthy();
    }));
});
