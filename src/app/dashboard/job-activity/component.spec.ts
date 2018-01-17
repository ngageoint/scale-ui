import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { JobsApiService } from '../../processing/jobs/api.service';
import { DashboardJobsService } from '../jobs.service';
import { JobActivityComponent } from './component';

describe('JobActivityComponent', () => {
    let component: JobActivityComponent;
    let fixture: ComponentFixture<JobActivityComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [JobActivityComponent],
            imports: [HttpModule],
            providers: [JobsApiService, DashboardJobsService],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JobActivityComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
