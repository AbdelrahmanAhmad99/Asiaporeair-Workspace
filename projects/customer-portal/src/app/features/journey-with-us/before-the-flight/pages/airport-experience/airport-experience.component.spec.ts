import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirportExperienceComponent } from './airport-experience.component';

describe('AirportExperienceComponent', () => {
  let component: AirportExperienceComponent;
  let fixture: ComponentFixture<AirportExperienceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirportExperienceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirportExperienceComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
