import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckInPolicyNoticeComponent } from './check-in-policy-notice.component';

describe('CheckInPolicyNoticeComponent', () => {
  let component: CheckInPolicyNoticeComponent;
  let fixture: ComponentFixture<CheckInPolicyNoticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckInPolicyNoticeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckInPolicyNoticeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
