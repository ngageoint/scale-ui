import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';

import { RecipeTypeConditionComponent } from './condition.component';

describe('RecipeTypeConditionComponent', () => {
    let component: RecipeTypeConditionComponent;
    let fixture: ComponentFixture<RecipeTypeConditionComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [RecipeTypeConditionComponent],
            imports: [HttpClientTestingModule],
            providers: [
                {provide: FormBuilder, useClass: class { group = jasmine.createSpy('group'); array = jasmine.createSpy('array'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RecipeTypeConditionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
