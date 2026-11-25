import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoyaltySummaryCardComponent } from './loyalty-summary-card.component';

describe('LoyaltySummaryCardComponent', () => {
  let component: LoyaltySummaryCardComponent;
  let fixture: ComponentFixture<LoyaltySummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoyaltySummaryCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoyaltySummaryCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
