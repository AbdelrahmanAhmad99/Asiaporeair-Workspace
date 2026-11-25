import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirportMetricsBarComponent } from './airport-metrics-bar.component';

describe('AirportMetricsBarComponent', () => {
  let component: AirportMetricsBarComponent;
  let fixture: ComponentFixture<AirportMetricsBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirportMetricsBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirportMetricsBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
