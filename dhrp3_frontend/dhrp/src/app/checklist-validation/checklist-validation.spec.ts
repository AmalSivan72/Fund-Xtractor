import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistValidation } from './checklist-validation';

describe('ChecklistValidation', () => {
  let component: ChecklistValidation;
  let fixture: ComponentFixture<ChecklistValidation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChecklistValidation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChecklistValidation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
