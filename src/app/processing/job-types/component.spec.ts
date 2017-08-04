import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobTypesComponent } from './component';


describe('JobTypesComponent', () => {
    let component: JobTypesComponent;
    let fixture: ComponentFixture<JobTypesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [JobTypesComponent],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JobTypesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
