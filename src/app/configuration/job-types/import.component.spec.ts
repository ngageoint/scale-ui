import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { JobTypesApiService } from './api.service';
import { JobTypesImportComponent } from './import.component';
import { WorkspacesApiService } from '../workspaces/api.service';


describe('JobTypesImportComponent', () => {
    let component: JobTypesImportComponent;
    let fixture: ComponentFixture<JobTypesImportComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [JobTypesImportComponent],
            imports: [HttpModule],
            providers: [
                JobTypesApiService, WorkspacesApiService, FormBuilder,
                {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }},
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JobTypesImportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
