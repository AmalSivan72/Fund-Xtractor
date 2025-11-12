import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskBrowser } from './risk-browser';

describe('RiskBrowser', () => {
  let component: RiskBrowser;
  let fixture: ComponentFixture<RiskBrowser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskBrowser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiskBrowser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
