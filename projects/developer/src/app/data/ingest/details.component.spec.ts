import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';

import { IngestApiService } from './api.service';
import { DataService } from '../../common/services/data.service';
import { IngestDetailsComponent } from './details.component';


describe('IngestDetailsComponent', () => {
    let component: IngestDetailsComponent;
    let fixture: ComponentFixture<IngestDetailsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [IngestDetailsComponent],
            imports: [HttpClientTestingModule],
            providers: [
                MessageService, IngestApiService, DataService,
                {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(IngestDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
