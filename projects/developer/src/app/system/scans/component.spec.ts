import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScansComponent } from './component';

describe('ScansComponent', () => {
    let component: ScansComponent;
    let fixture: ComponentFixture<ScansComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ScansComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ScansComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
