import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembershipRegistrationCenterComponent } from './membership-registration-center.component';

describe('MembershipRegistrationCenterComponent', () => {
  let component: MembershipRegistrationCenterComponent;
  let fixture: ComponentFixture<MembershipRegistrationCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembershipRegistrationCenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MembershipRegistrationCenterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
