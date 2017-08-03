import { TestBed, inject } from '@angular/core/testing';

import { RecipesDatatableService } from './datatable.service';

describe('RecipesDatatableService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [RecipesDatatableService]
        });
    });

    it('should be created', inject([RecipesDatatableService], (service: RecipesDatatableService) => {
        expect(service).toBeTruthy();
    }));
});
