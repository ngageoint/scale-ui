import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { MessageService } from 'primeng/components/common/messageservice';

import { RecipeTypesApiService } from './api.service';
import { JobTypesApiService } from '../job-types/api.service';
import { DataService } from '../../common/services/data.service';
import { RecipeTypesComponent } from './component';


describe('RecipeTypesComponent', () => {
    let component: RecipeTypesComponent;
    let fixture: ComponentFixture<RecipeTypesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RecipeTypesComponent],
            imports: [HttpClientTestingModule],
            providers: [
                MessageService, RecipeTypesApiService, JobTypesApiService, DataService,
                {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }},
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }},
                {provide: FormBuilder, useClass: class { group = jasmine.createSpy('group'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RecipeTypesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
