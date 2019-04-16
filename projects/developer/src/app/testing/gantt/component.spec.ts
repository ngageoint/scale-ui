import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';

import { DataService } from '../../common/services/data.service';
import { RecipesApiService } from './api.service';
import { JobTypesApiService } from '../../configuration/job-types/api.service';
import { RecipesDatatableService } from './datatable.service';
import { GanttComponent } from './component';


describe('JobsComponent', () => {
    let component: GanttComponent;
    let fixture: ComponentFixture<GanttComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GanttComponent],
            imports: [HttpClientTestingModule],
            providers: [
                DataService, RecipesApiService, RecipesDatatableService, JobTypesApiService, ConfirmationService, MessageService,
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
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GanttComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
