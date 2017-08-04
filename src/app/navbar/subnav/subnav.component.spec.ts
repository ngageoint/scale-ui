import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubnavComponent } from './subnav.component';


describe('SubnavComponent', () => {
    let component: SubnavComponent;
    let fixture: ComponentFixture<SubnavComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SubnavComponent],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SubnavComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
