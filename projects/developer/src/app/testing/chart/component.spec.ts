import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/components/common/messageservice';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../../common/services/data.service';
import { TestingComponent } from './component';
import { IngestApiService } from '../../data/ingest/api.service';
import { NewChartService } from './chart.service';
import { ChartService } from '../../data/metrics/chart.service';
import { MetricsApiService } from '../../data/metrics/api.service';
import { ColorService } from '../../common/services/color.service';
import { JobsApiService } from '../../processing/jobs/api.service';
import { FilesApiService } from '../../common/services/files/api.service';



describe('JobsComponent', () => {
    let component: TestingComponent;
    let fixture: ComponentFixture<TestingComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TestingComponent],
            imports: [HttpClientTestingModule],
            providers: [
                DataService, MessageService, IngestApiService, NewChartService, ChartService, MetricsApiService, ColorService,
                JobsApiService, FilesApiService
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});



