import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';

import { MetricsComponent } from './component';
import { ChartService } from './chart.service';
import { MetricsApiService } from './api.service';
import { DataService } from '../../data.service';


describe('JobsComponent', () => {
    let component: MetricsComponent;
    let fixture: ComponentFixture<MetricsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MetricsComponent],
            imports: [HttpModule],
            providers: [
                ChartService, MetricsApiService, DataService,
                {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }},
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MetricsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
