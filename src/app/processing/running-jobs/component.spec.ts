import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';

import { JobsApiService } from '../jobs/api.service';
import { RunningJobsDatatableService } from './datatable.service';
import { RunningJobsComponent } from './component';


describe('RunningJobsComponent', () => {
    let component: RunningJobsComponent;
    let fixture: ComponentFixture<RunningJobsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RunningJobsComponent],
            imports: [HttpModule],
            providers: [
                JobsApiService, RunningJobsDatatableService,
                {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }},
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RunningJobsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
