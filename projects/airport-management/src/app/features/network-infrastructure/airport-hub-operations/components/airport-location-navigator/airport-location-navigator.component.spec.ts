import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirportLocationNavigatorComponent } from './airport-location-navigator.component';

describe('AirportLocationNavigatorComponent', () => {
  let component: AirportLocationNavigatorComponent;
  let fixture: ComponentFixture<AirportLocationNavigatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirportLocationNavigatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirportLocationNavigatorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
