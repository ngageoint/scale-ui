import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { LoadingIndicatorComponent } from './component';


describe('LoadingIndicatorComponent', () => {
    let component: LoadingIndicatorComponent;
    let fixture: ComponentFixture<LoadingIndicatorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LoadingIndicatorComponent],
            imports: [HttpModule],
            providers: [],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LoadingIndicatorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
