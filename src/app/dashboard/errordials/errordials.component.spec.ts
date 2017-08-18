import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrordialsComponent } from './errordials.component';


describe('ErrordialsComponent', () => {
    let component: ErrordialsComponent;
    let fixture: ComponentFixture<ErrordialsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ErrordialsComponent],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ErrordialsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
