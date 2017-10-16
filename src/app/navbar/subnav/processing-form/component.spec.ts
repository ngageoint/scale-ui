import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingFormComponent } from './component';


describe('ProcessingformComponent', () => {
    let component: ProcessingFormComponent;
    let fixture: ComponentFixture<ProcessingFormComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProcessingFormComponent],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProcessingFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
