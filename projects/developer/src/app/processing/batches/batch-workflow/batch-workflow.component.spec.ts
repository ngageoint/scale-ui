import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchWorkflowComponent } from './batch-workflow.component';

describe('BatchWorkflowComponent', () => {
  let component: BatchWorkflowComponent;
  let fixture: ComponentFixture<BatchWorkflowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchWorkflowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('#getStepHeader', () => {

    it('should return the name of the current step', () => {
        component.items = [
            {label: 'Step 1'},
            {label: 'Step 2'}
        ];
        component.activeIndex = 1;
        expect(component.getStepHeader()).toBe('Step 2');
    });

    describe('when the step is optional', () => {
        // Step 1 is optional

        it('should return "(Optional)" in the header',  () => {
            component.items = [
                {label: 'Step 1'},
                {label: 'Step 2'}
            ];
            component.activeIndex = 0;
            expect(component.getStepHeader()).toBe('Step 1 (Optional)');
        });
    });
  });
});
