import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorService } from '../../color.service';
import { ErrorDialsComponent } from './component';


describe('ErrordialsComponent', () => {
    let component: ErrorDialsComponent;
    let fixture: ComponentFixture<ErrorDialsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ErrorDialsComponent],
            providers: [ColorService],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ErrorDialsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
