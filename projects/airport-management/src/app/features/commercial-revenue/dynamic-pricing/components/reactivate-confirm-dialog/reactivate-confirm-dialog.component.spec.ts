import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactivateConfirmDialogComponent } from './reactivate-confirm-dialog.component';

describe('ReactivateConfirmDialogComponent', () => {
  let component: ReactivateConfirmDialogComponent;
  let fixture: ComponentFixture<ReactivateConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactivateConfirmDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReactivateConfirmDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
