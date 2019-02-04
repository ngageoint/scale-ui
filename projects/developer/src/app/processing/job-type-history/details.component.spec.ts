import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';

import { JobTypesApiService } from '../../configuration/job-types/api.service';
import { DataService } from '../../common/services/data.service';
import { JobTypeHistoryDetailsComponent } from './details.component';


describe('JobTypeHistoryDetailsComponent', () => {
    let component: JobTypeHistoryDetailsComponent;
    let fixture: ComponentFixture<JobTypeHistoryDetailsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [JobTypeHistoryDetailsComponent],
            imports: [HttpClientTestingModule],
            providers: [
                MessageService, JobTypesApiService, DataService,
                {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JobTypeHistoryDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
