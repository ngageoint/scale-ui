import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';

import { RecipeTypeFilterComponent } from './filter.component';

describe('RecipeTypeFilterComponent', () => {
    let component: RecipeTypeFilterComponent;
    let fixture: ComponentFixture<RecipeTypeFilterComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [RecipeTypeFilterComponent],
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
        fixture = TestBed.createComponent(RecipeTypeFilterComponent);
        component = fixture.componentInstance;
        // TODO this.form() is undefined if next line is uncommented
        // fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
