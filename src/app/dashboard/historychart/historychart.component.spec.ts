import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpModule } from '@angular/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardJobsService } from '../jobs.service';
import { ChartService } from '../../data/metrics/chart.service';
import { MetricsApiService } from '../../data/metrics/api.service';
import { ColorService } from '../../color.service';
import { HistorychartComponent } from './historychart.component';


describe('HistorychartComponent', () => {
    let component: HistorychartComponent;
    let fixture: ComponentFixture<HistorychartComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            declarations: [HistorychartComponent],
            providers: [DashboardJobsService, ChartService, MetricsApiService, ColorService],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HistorychartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
