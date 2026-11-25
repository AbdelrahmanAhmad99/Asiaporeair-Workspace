import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineSummaryWidgetsComponent } from './airline-summary-widgets.component';

describe('AirlineSummaryWidgetsComponent', () => {
  let component: AirlineSummaryWidgetsComponent;
  let fixture: ComponentFixture<AirlineSummaryWidgetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineSummaryWidgetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineSummaryWidgetsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
