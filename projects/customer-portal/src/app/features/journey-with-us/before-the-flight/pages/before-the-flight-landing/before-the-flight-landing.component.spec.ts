import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeforeTheFlightLandingComponent } from './before-the-flight-landing.component';

describe('BeforeTheFlightLandingComponent', () => {
  let component: BeforeTheFlightLandingComponent;
  let fixture: ComponentFixture<BeforeTheFlightLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeforeTheFlightLandingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeforeTheFlightLandingComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
