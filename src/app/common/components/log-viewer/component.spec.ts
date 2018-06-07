import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/components/common/messageservice';
import { HttpModule } from '@angular/http';

import { DataService } from '../../services/data.service';
import { LogViewerApiService } from './api.service';
import { LogViewerComponent } from './component';


describe('LogViewerComponent', () => {
    let component: LogViewerComponent;
    let fixture: ComponentFixture<LogViewerComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LogViewerComponent],
            imports: [HttpModule],
            providers: [
                MessageService,
                DataService,
                LogViewerApiService
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LogViewerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
