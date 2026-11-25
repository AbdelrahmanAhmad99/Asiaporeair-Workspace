import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostBreakdownTableComponent } from './cost-breakdown-table.component';

describe('CostBreakdownTableComponent', () => {
  let component: CostBreakdownTableComponent;
  let fixture: ComponentFixture<CostBreakdownTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostBreakdownTableComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CostBreakdownTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
