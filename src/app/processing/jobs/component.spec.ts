import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';

import { JobsApiService } from './api.service';
import { JobTypesApiService } from '../job-types/api.service';
import { JobsDatatableService } from './datatable.service';
import { JobsComponent } from './component';


describe('JobsComponent', () => {
    let component: JobsComponent;
    let fixture: ComponentFixture<JobsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [JobsComponent],
            imports: [HttpModule],
            providers: [
                JobsApiService, JobsDatatableService, JobTypesApiService,
                {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }},
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JobsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
