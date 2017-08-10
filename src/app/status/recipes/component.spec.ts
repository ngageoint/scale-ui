import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';

import { RecipesApiService } from './api.service';
import { RecipesDatatableService} from './datatable.service';
import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';
import { RecipesComponent } from './component';

describe('RecipesComponent', () => {
    let component: RecipesComponent;
    let fixture: ComponentFixture<RecipesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RecipesComponent],
            imports: [HttpModule],
            providers: [
                RecipesApiService, RecipesDatatableService, RecipeTypesApiService,
                {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }},
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RecipesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
