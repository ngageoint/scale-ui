import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../../common/services/data.service';
import { RecipesApiService } from './api.service';


describe('RecipesApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, RecipesApiService]
        });
    });

    it('should be created', inject([RecipesApiService], (service: RecipesApiService) => {
        expect(service).toBeTruthy();
    }));
});
