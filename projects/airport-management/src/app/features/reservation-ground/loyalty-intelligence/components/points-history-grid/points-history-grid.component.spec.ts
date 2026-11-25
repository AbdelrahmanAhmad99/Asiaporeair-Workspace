import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointsHistoryGridComponent } from './points-history-grid.component';

describe('PointsHistoryGridComponent', () => {
  let component: PointsHistoryGridComponent;
  let fixture: ComponentFixture<PointsHistoryGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointsHistoryGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointsHistoryGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
