import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrewReadinessGaugeComponent } from './crew-readiness-gauge.component';

describe('CrewReadinessGaugeComponent', () => {
  let component: CrewReadinessGaugeComponent;
  let fixture: ComponentFixture<CrewReadinessGaugeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrewReadinessGaugeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrewReadinessGaugeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
