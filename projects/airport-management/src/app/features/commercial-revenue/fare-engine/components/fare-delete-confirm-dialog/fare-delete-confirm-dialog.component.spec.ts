import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FareDeleteConfirmDialogComponent } from './fare-delete-confirm-dialog.component';

describe('FareDeleteConfirmDialogComponent', () => {
  let component: FareDeleteConfirmDialogComponent;
  let fixture: ComponentFixture<FareDeleteConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FareDeleteConfirmDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FareDeleteConfirmDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
