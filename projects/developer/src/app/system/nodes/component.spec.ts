import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import { Subject } from 'rxjs';

import { NodesComponent } from './component';
import { NodesApiService } from './api.service';
import { StatusService } from '../../common/services/status.service';
import { DataService } from '../../common/services/data.service';

describe('NodesComponent', () => {
    let component: NodesComponent;
    let fixture: ComponentFixture<NodesComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [NodesComponent],
            imports: [HttpClientTestingModule],
            providers: [
                MessageService, NodesApiService, StatusService, DataService,
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
        fixture = TestBed.createComponent(NodesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
