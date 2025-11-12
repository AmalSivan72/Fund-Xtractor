import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TocViewer } from './toc-viewer';

describe('TocViewer', () => {
  let component: TocViewer;
  let fixture: ComponentFixture<TocViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TocViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TocViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
