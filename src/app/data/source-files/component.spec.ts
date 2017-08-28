import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';

import { SourceFilesApiService } from './api.service';
import { SourceFilesComponent } from './component';
import { SourceFilesDatatableService } from './datatable.service';

describe('SourceFilesComponent', () => {
    let component: SourceFilesComponent;
    let fixture: ComponentFixture<SourceFilesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SourceFilesComponent],
            imports: [HttpModule],
            providers: [
                SourceFilesApiService, SourceFilesDatatableService,
                {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }},
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SourceFilesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
