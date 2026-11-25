import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckInConfirmationComponent } from './check-in-confirmation.component';

describe('CheckInConfirmationComponent', () => {
  let component: CheckInConfirmationComponent;
  let fixture: ComponentFixture<CheckInConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckInConfirmationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckInConfirmationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
