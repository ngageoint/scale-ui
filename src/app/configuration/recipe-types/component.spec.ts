import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';

import { RecipeTypesApiService } from './api.service';
import { RecipeTypesComponent } from './component';


describe('RecipeTypesComponent', () => {
    let component: RecipeTypesComponent;
    let fixture: ComponentFixture<RecipeTypesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RecipeTypesComponent],
            imports: [HttpModule],
            providers: [
                RecipeTypesApiService,
                {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }},
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RecipeTypesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
