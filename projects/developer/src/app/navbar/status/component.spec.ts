import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/components/common/messageservice';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../../common/services/data.service';
import { StatusService } from '../../common/services/status.service';
import { StatusApiService } from '../../system/status/api.service';
import { StatusComponent } from './component';

describe('StatusComponent', () => {
    let component: StatusComponent;
    let fixture: ComponentFixture<StatusComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [StatusComponent],
            imports: [HttpClientTestingModule],
            providers: [DataService, MessageService, StatusService, StatusApiService],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StatusComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
