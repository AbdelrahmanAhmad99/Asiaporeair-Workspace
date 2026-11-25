import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestoreConfirmationModalComponent } from './restore-confirmation-modal.component';

describe('RestoreConfirmationModalComponent', () => {
  let component: RestoreConfirmationModalComponent;
  let fixture: ComponentFixture<RestoreConfirmationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestoreConfirmationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestoreConfirmationModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
