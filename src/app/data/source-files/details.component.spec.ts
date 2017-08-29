import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { ActivatedRoute } from '@angular/router';

import { SourceFilesApiService } from './api.service';
import { SourceFileDetailsComponent } from './details.component';
import { DataService } from '../../data.service';


describe('SourceFileDetailsComponent', () => {
    let component: SourceFileDetailsComponent;
    let fixture: ComponentFixture<SourceFileDetailsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SourceFileDetailsComponent],
            imports: [HttpModule],
            providers: [
                SourceFilesApiService, DataService,
                {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SourceFileDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
