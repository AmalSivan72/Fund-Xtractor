import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyBrowser } from './company-browser';

describe('CompanyBrowser', () => {
  let component: CompanyBrowser;
  let fixture: ComponentFixture<CompanyBrowser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyBrowser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyBrowser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
