import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

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
