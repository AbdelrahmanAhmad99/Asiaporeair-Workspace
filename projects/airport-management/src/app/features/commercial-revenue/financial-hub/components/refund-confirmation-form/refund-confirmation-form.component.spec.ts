import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundConfirmationFormComponent } from './refund-confirmation-form.component';

describe('RefundConfirmationFormComponent', () => {
  let component: RefundConfirmationFormComponent;
  let fixture: ComponentFixture<RefundConfirmationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefundConfirmationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RefundConfirmationFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
