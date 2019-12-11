import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectRecipeTypeComponent } from './select-recipe-type.component';

describe('SelectRecipeTypeComponent', () => {
  let component: SelectRecipeTypeComponent;
  let fixture: ComponentFixture<SelectRecipeTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectRecipeTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectRecipeTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
