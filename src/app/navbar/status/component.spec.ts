import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/components/common/messageservice';
import { HttpModule } from '@angular/http';

import { DataService } from '../../data.service';
import { StatusApiService } from './api.service';
import { StatusComponent } from './component';

describe('StatusComponent', () => {
    let component: StatusComponent;
    let fixture: ComponentFixture<StatusComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StatusComponent],
            imports: [HttpModule],
            providers: [DataService, MessageService, StatusApiService],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StatusComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
