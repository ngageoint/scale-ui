import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';

import { DataService } from '../../data.service';
import { JobTypesApiService } from './api.service';
import { ColorService } from '../../color.service';
import { JobTypesComponent } from './component';


describe('JobTypesComponent', () => {
    let component: JobTypesComponent;
    let fixture: ComponentFixture<JobTypesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [JobTypesComponent],
            imports: [HttpModule],
            providers: [
                DataService, JobTypesApiService, ColorService,
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
