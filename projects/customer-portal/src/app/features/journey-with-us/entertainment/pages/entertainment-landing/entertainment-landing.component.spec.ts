import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntertainmentLandingComponent } from './entertainment-landing.component';

describe('EntertainmentLandingComponent', () => {
  let component: EntertainmentLandingComponent;
  let fixture: ComponentFixture<EntertainmentLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntertainmentLandingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntertainmentLandingComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
