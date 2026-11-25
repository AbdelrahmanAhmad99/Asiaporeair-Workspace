import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificationSummaryCardComponent } from './modification-summary-card.component';

describe('ModificationSummaryCardComponent', () => {
  let component: ModificationSummaryCardComponent;
  let fixture: ComponentFixture<ModificationSummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificationSummaryCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificationSummaryCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
