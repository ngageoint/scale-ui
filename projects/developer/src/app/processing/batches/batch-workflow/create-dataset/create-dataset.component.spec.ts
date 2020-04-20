import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDatasetComponent } from './create-dataset.component';

describe('CreateDatasetComponent', () => {
    let component: CreateDatasetComponent;
    let fixture: ComponentFixture<CreateDatasetComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CreateDatasetComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateDatasetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
