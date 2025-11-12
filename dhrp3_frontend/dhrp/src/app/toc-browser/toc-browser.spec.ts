import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TocBrowser } from './toc-browser';

describe('TocBrowser', () => {
  let component: TocBrowser;
  let fixture: ComponentFixture<TocBrowser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TocBrowser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TocBrowser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
