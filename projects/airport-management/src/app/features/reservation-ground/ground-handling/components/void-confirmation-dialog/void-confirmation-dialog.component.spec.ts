import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoidConfirmationDialogComponent } from './void-confirmation-dialog.component';

describe('VoidConfirmationDialogComponent', () => {
  let component: VoidConfirmationDialogComponent;
  let fixture: ComponentFixture<VoidConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoidConfirmationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoidConfirmationDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
