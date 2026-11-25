import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StickyBookingBarComponent } from './sticky-booking-bar.component';

describe('StickyBookingBarComponent', () => {
  let component: StickyBookingBarComponent;
  let fixture: ComponentFixture<StickyBookingBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StickyBookingBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StickyBookingBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
