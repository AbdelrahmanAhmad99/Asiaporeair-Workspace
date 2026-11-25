import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetRangeAnalyzerComponent } from './fleet-range-analyzer.component';

describe('FleetRangeAnalyzerComponent', () => {
  let component: FleetRangeAnalyzerComponent;
  let fixture: ComponentFixture<FleetRangeAnalyzerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FleetRangeAnalyzerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FleetRangeAnalyzerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
