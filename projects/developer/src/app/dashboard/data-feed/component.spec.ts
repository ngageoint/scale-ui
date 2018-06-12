import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/components/common/messageservice';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../../common/services/data.service';
import { DataFeedComponent } from './component';
import { IngestApiService } from '../../data/ingest/api.service';
import { DashboardJobsService } from '../jobs.service';
import { ChartService } from '../../data/metrics/chart.service';
import { MetricsApiService } from '../../data/metrics/api.service';
import { ColorService } from '../../common/services/color.service';
import { JobsApiService } from '../../processing/jobs/api.service';
import { ProductsApiService } from '../../common/components/products/api.service';

describe('DataFeedComponent', () => {
    let component: DataFeedComponent;
    let fixture: ComponentFixture<DataFeedComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DataFeedComponent],
            imports: [HttpClientTestingModule],
            providers: [
                DataService, MessageService, IngestApiService, DashboardJobsService, ChartService, MetricsApiService, ColorService,
                JobsApiService, ProductsApiService
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DataFeedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
