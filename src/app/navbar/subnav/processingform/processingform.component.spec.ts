import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingformComponent } from './processingform.component';

describe('ProcessingformComponent', () => {
  let component: ProcessingformComponent;
  let fixture: ComponentFixture<ProcessingformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessingformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
