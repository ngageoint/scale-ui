import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';

import { DataService } from '../../common/services/data.service';
import { BatchesApiService } from './api.service';
import { BatchesEditComponent } from './edit.component';
import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';

describe('BatchesEditComponent', () => {
    let component: BatchesEditComponent;
    let fixture: ComponentFixture<BatchesEditComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BatchesEditComponent],
            imports: [HttpClientTestingModule],
            providers: [
                DataService, BatchesApiService, MessageService, RecipeTypesApiService,
                {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }},
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BatchesEditComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
