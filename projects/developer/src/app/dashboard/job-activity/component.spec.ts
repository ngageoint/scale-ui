import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/components/common/messageservice';

import { DataService } from '../../common/services/data.service';
import { JobTypesApiService } from '../../configuration/job-types/api.service';
import { DashboardJobsService } from '../jobs.service';
import { JobActivityComponent } from './component';

describe('JobActivityComponent', () => {
    let component: JobActivityComponent;
    let fixture: ComponentFixture<JobActivityComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [JobActivityComponent],
            imports: [HttpClientTestingModule],
            providers: [DataService, MessageService, JobTypesApiService, DashboardJobsService],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JobActivityComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
