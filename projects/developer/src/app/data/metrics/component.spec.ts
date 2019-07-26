import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';

import { MetricsComponent } from './component';
import { ColorService } from '../../common/services/color.service';
import { ChartService } from './chart.service';
import { MetricsApiService } from './api.service';
import { DataService } from '../../common/services/data.service';


describe('MetricsComponent', () => {
    let component: MetricsComponent;
    let fixture: ComponentFixture<MetricsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MetricsComponent],
            imports: [HttpClientTestingModule],
            providers: [
                MessageService, ColorService, ChartService, MetricsApiService, DataService,
                {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }},
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MetricsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
