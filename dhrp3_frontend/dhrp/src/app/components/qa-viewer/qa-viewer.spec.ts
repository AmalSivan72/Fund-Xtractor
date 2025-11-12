import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QaViewer } from './qa-viewer';

describe('QaViewer', () => {
  let component: QaViewer;
  let fixture: ComponentFixture<QaViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QaViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QaViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
