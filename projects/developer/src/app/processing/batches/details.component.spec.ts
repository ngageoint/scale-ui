import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { MessageService } from 'primeng/components/common/messageservice';

import { DataService } from '../../common/services/data.service';
import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';
import { BatchesApiService } from './api.service';
import { BatchDetailsComponent } from './details.component';

describe('BatchDetailsComponent', () => {
    let component: BatchDetailsComponent;
    let fixture: ComponentFixture<BatchDetailsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BatchDetailsComponent],
            imports: [HttpClientTestingModule],
            providers: [
                DataService, MessageService, RecipeTypesApiService, BatchesApiService,
                {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }},
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }},
                {provide: FormBuilder, useClass: class { group = jasmine.createSpy('group'); array = jasmine.createSpy('array'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BatchDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
