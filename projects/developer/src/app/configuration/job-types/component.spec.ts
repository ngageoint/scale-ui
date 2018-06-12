import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';

import { DataService } from '../../common/services/data.service';
import { JobTypesApiService } from './api.service';
import { ColorService } from '../../common/services/color.service';
import { WorkspacesApiService } from '../workspaces/api.service';
import { ScansApiService } from '../../common/components/scans/api.service';
import { JobTypesComponent } from './component';


describe('JobTypesComponent', () => {
    let component: JobTypesComponent;
    let fixture: ComponentFixture<JobTypesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [JobTypesComponent],
            imports: [HttpClientTestingModule],
            providers: [
                MessageService, DataService, JobTypesApiService, ColorService, WorkspacesApiService, ScansApiService,
                {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }},
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JobTypesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
