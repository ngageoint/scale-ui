import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemporalFilterComponent } from './component';

describe('TemporalFilterComponent', () => {
    let component: TemporalFilterComponent;
    let fixture: ComponentFixture<TemporalFilterComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TemporalFilterComponent],
            imports: [],
            providers: [],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TemporalFilterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
