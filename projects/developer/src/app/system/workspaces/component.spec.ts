import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { MessageService } from 'primeng/components/common/messageservice';
import { Subject } from 'rxjs';

import { DataService } from '../../common/services/data.service';
import { WorkspacesApiService } from './api.service';
import { WorkspacesComponent } from './component';


describe('WorkspacesComponent', () => {
    let component: WorkspacesComponent;
    let fixture: ComponentFixture<WorkspacesComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WorkspacesComponent],
            imports: [HttpClientTestingModule],
            providers: [
                MessageService, DataService, WorkspacesApiService,
                {
                    provide: ActivatedRoute,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                        queryParams = new Subject<any>();
                    }
                },
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }},
                {provide: FormBuilder, useClass: class { group = jasmine.createSpy('group'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WorkspacesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
