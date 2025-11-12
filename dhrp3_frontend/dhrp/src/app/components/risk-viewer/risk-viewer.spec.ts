import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskViewer } from './risk-viewer';

describe('RiskViewer', () => {
  let component: RiskViewer;
  let fixture: ComponentFixture<RiskViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiskViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
