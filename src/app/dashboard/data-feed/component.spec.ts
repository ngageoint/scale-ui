import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { DataFeedComponent } from './component';
import { IngestApiService } from '../../data/ingest/api.service';

describe('JobActivityComponent', () => {
    let component: DataFeedComponent;
    let fixture: ComponentFixture<DataFeedComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DataFeedComponent],
            imports: [HttpModule],
            providers: [IngestApiService],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DataFeedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
