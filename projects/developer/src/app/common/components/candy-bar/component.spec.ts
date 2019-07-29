import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CandyBarComponent } from './component';


describe('CandyBarComponent', () => {
    let component: CandyBarComponent;
    let fixture: ComponentFixture<CandyBarComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CandyBarComponent],
            imports: [HttpClientTestingModule],
            providers: [],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CandyBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
