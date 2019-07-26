import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';

import { JobsApiService } from './api.service';
import { DataService } from '../../common/services/data.service';
import { JobDetailsComponent } from './details.component';


describe('JobDetailsComponent', () => {
    let component: JobDetailsComponent;
    let fixture: ComponentFixture<JobDetailsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [JobDetailsComponent],
            imports: [HttpClientTestingModule],
            providers: [
                MessageService, JobsApiService, DataService,
                {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JobDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
