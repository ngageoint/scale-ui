import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { DataService } from '../../common/services/data.service';
import { SourcesApiService } from './api.service';
import { SourcesComponent } from './component';
import { SourcesDatatableService } from './datatable.service';

describe('SourceFilesComponent', () => {
    let component: SourcesComponent;
    let fixture: ComponentFixture<SourcesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SourcesComponent],
            imports: [HttpClientTestingModule],
            providers: [
                DataService, SourcesApiService, SourcesDatatableService,
                {
                    provide: ActivatedRoute,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                        queryParams = new Subject<any>();
                        datatableOptions = jasmine.createSpy('datatableOptions');
                    },
                },
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SourcesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
