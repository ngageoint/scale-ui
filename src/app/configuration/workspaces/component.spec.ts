import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';

import { WorkspacesApiService } from './api.service';
import { WorkspacesComponent } from './component';


describe('WorkspacesComponent', () => {
    let component: WorkspacesComponent;
    let fixture: ComponentFixture<WorkspacesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [WorkspacesComponent],
            imports: [HttpModule],
            providers: [
                WorkspacesApiService,
                {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }},
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WorkspacesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
