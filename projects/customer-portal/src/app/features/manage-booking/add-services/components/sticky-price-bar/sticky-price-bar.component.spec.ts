import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StickyPriceBarComponent } from './sticky-price-bar.component';

describe('StickyPriceBarComponent', () => {
  let component: StickyPriceBarComponent;
  let fixture: ComponentFixture<StickyPriceBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StickyPriceBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StickyPriceBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
