import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import { FormBuilder } from '@angular/forms';

import { DataService } from '../../common/services/data.service';
import { BatchesApiService } from './api.service';
import { BatchesCreateComponent } from './create.component';
import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';

describe('BatchesComponent', () => {
    let component: BatchesCreateComponent;
    let fixture: ComponentFixture<BatchesCreateComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BatchesCreateComponent],
            imports: [HttpClientTestingModule],
            providers: [
                DataService, BatchesApiService, MessageService, RecipeTypesApiService, FormBuilder,
                {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }},
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BatchesCreateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
