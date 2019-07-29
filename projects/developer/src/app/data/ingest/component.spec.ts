import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { MessageService } from 'primeng/components/common/messageservice';

import { DataService } from '../../common/services/data.service';
import { IngestDatatableService } from './datatable.service';
import { IngestApiService } from './api.service';
import { StrikesApiService } from '../../system/strikes/api.service';
import { IngestComponent } from './component';

describe('IngestComponent', () => {
    let component: IngestComponent;
    let fixture: ComponentFixture<IngestComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [IngestComponent],
            imports: [HttpClientTestingModule],
            providers: [
                MessageService, DataService, IngestDatatableService, IngestApiService, StrikesApiService,
                {
                    provide: ActivatedRoute,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                        queryParams = new Subject<any>();
                        datatableOptions = jasmine.createSpy('datatableOptions');
                    }
                },
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(IngestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
