import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QaBrowser } from './qa-browser';

describe('QaBrowser', () => {
  let component: QaBrowser;
  let fixture: ComponentFixture<QaBrowser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QaBrowser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QaBrowser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
