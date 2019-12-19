import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RunBatchComponent } from './run-batch.component';

describe('RunBatchComponent', () => {
  let component: RunBatchComponent;
  let fixture: ComponentFixture<RunBatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RunBatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
