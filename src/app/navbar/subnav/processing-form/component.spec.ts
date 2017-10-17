import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpModule } from '@angular/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingFormComponent } from './component';
import { JobTypesApiService } from '../../../configuration/job-types/api.service';


describe('ProcessingformComponent', () => {
    let component: ProcessingFormComponent;
    let fixture: ComponentFixture<ProcessingFormComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProcessingFormComponent],
            imports: [HttpModule],
            providers: [
                JobTypesApiService
            ],
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
