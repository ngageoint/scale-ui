import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MessageService } from 'primeng/components/common/messageservice';

import { ColorService } from '../../services/color.service';
import { DataService } from '../../services/data.service';
import { QueueApiService } from '../../services/queue/api.service';
import { QueueLoadComponent } from './component';

describe('QueueLoadComponent', () => {
    let component: QueueLoadComponent;
    let fixture: ComponentFixture<QueueLoadComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QueueLoadComponent],
            imports: [HttpClientTestingModule],
            providers: [
                MessageService, ColorService, DataService, QueueApiService,
                {
                    provide: ActivatedRoute,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                        queryParams = new Subject<any>();
                    }
                },
                {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QueueLoadComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
