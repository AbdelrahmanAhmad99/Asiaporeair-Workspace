import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeactivationConfirmDialogComponent } from './deactivation-confirm-dialog.component';

describe('DeactivationConfirmDialogComponent', () => {
  let component: DeactivationConfirmDialogComponent;
  let fixture: ComponentFixture<DeactivationConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeactivationConfirmDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeactivationConfirmDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
