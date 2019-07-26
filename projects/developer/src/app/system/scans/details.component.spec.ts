import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { MessageService } from 'primeng/components/common/messageservice';
import { Subject } from 'rxjs';

import { ScanDetailsComponent } from './details.component';
import { ScansApiService } from './api.service';
import { DataService } from '../../common/services/data.service';
import { WorkspacesApiService } from '../workspaces/api.service';
import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';

describe('ScanDetailsComponent', () => {
    let component: ScanDetailsComponent;
    let fixture: ComponentFixture<ScanDetailsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ScanDetailsComponent],
            imports: [HttpClientTestingModule],
            providers: [
                MessageService, ScansApiService, DataService, WorkspacesApiService, RecipeTypesApiService,
                {
                    provide: ActivatedRoute,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                        queryParams = new Subject<any>();
                    }
                },
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }},
                {provide: FormBuilder, useClass: class { group = jasmine.createSpy('group'); array = jasmine.createSpy('array'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ScanDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
