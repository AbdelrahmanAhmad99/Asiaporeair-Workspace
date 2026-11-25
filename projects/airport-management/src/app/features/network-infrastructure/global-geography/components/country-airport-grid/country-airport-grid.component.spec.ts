import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryAirportGridComponent } from './country-airport-grid.component';

describe('CountryAirportGridComponent', () => {
  let component: CountryAirportGridComponent;
  let fixture: ComponentFixture<CountryAirportGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryAirportGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountryAirportGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
