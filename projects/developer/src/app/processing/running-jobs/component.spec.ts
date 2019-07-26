import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/components/common/messageservice';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { DataService } from '../../common/services/data.service';
import { JobTypesApiService } from '../../configuration/job-types/api.service';
import { RunningJobsDatatableService } from './datatable.service';
import { RunningJobsComponent } from './component';
import { JobsDatatableService } from '../jobs/datatable.service';


describe('RunningJobsComponent', () => {
    let component: RunningJobsComponent;
    let fixture: ComponentFixture<RunningJobsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [RunningJobsComponent],
            imports: [HttpClientTestingModule],
            providers: [
                DataService, MessageService, JobTypesApiService, RunningJobsDatatableService, JobsDatatableService,
                {
                    provide: ActivatedRoute,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                        queryParams = new Subject<any>();
                        datatableOptions = jasmine.createSpy('datatableOptions');
                    }
                },
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RunningJobsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
