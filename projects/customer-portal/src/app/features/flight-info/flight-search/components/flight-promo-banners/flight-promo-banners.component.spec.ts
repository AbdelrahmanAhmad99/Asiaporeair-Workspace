import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightPromoBannersComponent } from './flight-promo-banners.component';

describe('FlightPromoBannersComponent', () => {
  let component: FlightPromoBannersComponent;
  let fixture: ComponentFixture<FlightPromoBannersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightPromoBannersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightPromoBannersComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
