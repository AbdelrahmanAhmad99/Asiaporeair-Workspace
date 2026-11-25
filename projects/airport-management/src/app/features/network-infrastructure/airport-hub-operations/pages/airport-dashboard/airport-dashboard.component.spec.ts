import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirportDashboardComponent } from './airport-dashboard.component';

describe('AirportDashboardComponent', () => {
  let component: AirportDashboardComponent;
  let fixture: ComponentFixture<AirportDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirportDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirportDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
