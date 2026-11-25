import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointAdjustmentDeskComponent } from './point-adjustment-desk.component';

describe('PointAdjustmentDeskComponent', () => {
  let component: PointAdjustmentDeskComponent;
  let fixture: ComponentFixture<PointAdjustmentDeskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointAdjustmentDeskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointAdjustmentDeskComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
