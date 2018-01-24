import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { IngestComponent } from './component';

describe('IngestComponent', () => {
    let component: IngestComponent;
    let fixture: ComponentFixture<IngestComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [IngestComponent],
            imports: [HttpModule],
            providers: [],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IngestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
