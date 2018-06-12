import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthbarComponent } from './healthbar.component';


describe('HealthbarComponent', () => {
    let component: HealthbarComponent;
    let fixture: ComponentFixture<HealthbarComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [HealthbarComponent]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HealthbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
