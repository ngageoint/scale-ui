import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { DataService } from '../../common/services/data.service';
import { JobTypeHistoryComponent } from './component';
import { JobTypeHistoryDatatableService } from './datatable.service';
import { JobTypesApiService } from '../../configuration/job-types/api.service';
import { MetricsApiService } from '../../data/metrics/api.service';


describe('JobTypeHistoryComponent', () => {
    let component: JobTypeHistoryComponent;
    let fixture: ComponentFixture<JobTypeHistoryComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [JobTypeHistoryComponent],
            imports: [HttpClientTestingModule],
            providers: [
                DataService, JobTypeHistoryDatatableService, JobTypesApiService, MetricsApiService,
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
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JobTypeHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
