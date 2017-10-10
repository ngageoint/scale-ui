import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';

import { FailureRatesComponent } from './component';
import { FailureRatesDatatableService } from './datatable.service';
import { JobTypesApiService } from '../../configuration/job-types/api.service';
import { MetricsApiService } from '../../data/metrics/api.service';


describe('JobsComponent', () => {
    let component: FailureRatesComponent;
    let fixture: ComponentFixture<FailureRatesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FailureRatesComponent],
            imports: [HttpModule],
            providers: [
                FailureRatesDatatableService, JobTypesApiService, MetricsApiService,
                {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }},
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FailureRatesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
