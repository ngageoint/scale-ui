import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/components/common/messageservice';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { DataService } from '../../common/services/data.service';
import { QueueApiService } from '../../common/services/queue/api.service';
import { QueuedJobsComponent } from './component';


describe('QueuedJobsComponent', () => {
    let component: QueuedJobsComponent;
    let fixture: ComponentFixture<QueuedJobsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [QueuedJobsComponent],
            imports: [HttpClientTestingModule],
            providers: [
                MessageService, DataService, QueueApiService,
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(QueuedJobsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
