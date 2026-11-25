import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileRoleBadgeComponent } from './user-profile-role-badge.component';

describe('UserProfileRoleBadgeComponent', () => {
  let component: UserProfileRoleBadgeComponent;
  let fixture: ComponentFixture<UserProfileRoleBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileRoleBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserProfileRoleBadgeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
