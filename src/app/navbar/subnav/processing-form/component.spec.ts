import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpModule } from '@angular/http';
import { Router } from '@angular/router';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingFormComponent } from './component';
import { JobTypesApiService } from '../../../configuration/job-types/api.service';
import { JobsDatatableService } from '../../../processing/jobs/datatable.service';
import { SourcesDatatableService } from '../../../data/sources/datatable.service';


describe('ProcessingformComponent', () => {
    let component: ProcessingFormComponent;
    let fixture: ComponentFixture<ProcessingFormComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProcessingFormComponent],
            imports: [HttpModule],
            providers: [
                JobTypesApiService, JobsDatatableService, SourcesDatatableService,
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }}
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
