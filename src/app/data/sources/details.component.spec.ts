import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { ActivatedRoute } from '@angular/router';

import { SourcesApiService } from './api.service';
import { SourceDetailsComponent } from './details.component';
import { DataService } from '../../data.service';
import { JobsDatatableService } from '../../processing/jobs/datatable.service';

describe('SourceDetailsComponent', () => {
    let component: SourceDetailsComponent;
    let fixture: ComponentFixture<SourceDetailsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SourceDetailsComponent],
            imports: [HttpModule],
            providers: [
                SourcesApiService, DataService, JobsDatatableService,
                {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SourceDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
