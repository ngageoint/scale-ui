import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobTypesComponent } from './job-types.component';

describe('JobTypesComponent', () => {
  let component: JobTypesComponent;
  let fixture: ComponentFixture<JobTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
