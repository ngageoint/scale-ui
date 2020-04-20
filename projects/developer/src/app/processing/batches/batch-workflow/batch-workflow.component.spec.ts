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
});
