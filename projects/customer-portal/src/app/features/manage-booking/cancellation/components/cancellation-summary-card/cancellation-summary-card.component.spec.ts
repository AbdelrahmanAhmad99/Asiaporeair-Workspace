import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancellationSummaryCardComponent } from './cancellation-summary-card.component';

describe('CancellationSummaryCardComponent', () => {
  let component: CancellationSummaryCardComponent;
  let fixture: ComponentFixture<CancellationSummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancellationSummaryCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancellationSummaryCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
