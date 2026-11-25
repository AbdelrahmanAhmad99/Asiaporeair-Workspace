import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualAdjustmentFormComponent } from './manual-adjustment-form.component';

describe('ManualAdjustmentFormComponent', () => {
  let component: ManualAdjustmentFormComponent;
  let fixture: ComponentFixture<ManualAdjustmentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualAdjustmentFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualAdjustmentFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
