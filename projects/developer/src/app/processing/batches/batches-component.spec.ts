import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { MessageService } from 'primeng/components/common/messageservice';

import { DataService } from '../../common/services/data.service';
import { BatchesApiService } from './api.service';
import { BatchesComponent } from './batches-component';
import { BatchesDatatableService } from './datatable.service';
import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';

describe('BatchesComponent', () => {
    let component: BatchesComponent;
    let fixture: ComponentFixture<BatchesComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BatchesComponent],
            imports: [HttpClientTestingModule],
            providers: [
                DataService, BatchesApiService, BatchesDatatableService, RecipeTypesApiService, MessageService,
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
        fixture = TestBed.createComponent(BatchesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
