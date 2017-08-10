import { TestBed, inject } from '@angular/core/testing';

import { RecipeTypesDatatableService } from './datatable.service';

describe('RecipeTypesDatatableService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [RecipeTypesDatatableService]
        });
    });

    it('should be created', inject([RecipeTypesDatatableService], (service: RecipeTypesDatatableService) => {
        expect(service).toBeTruthy();
    }));
});
