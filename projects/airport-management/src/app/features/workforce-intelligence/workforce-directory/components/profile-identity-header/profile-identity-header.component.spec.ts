import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileIdentityHeaderComponent } from './profile-identity-header.component';

describe('ProfileIdentityHeaderComponent', () => {
  let component: ProfileIdentityHeaderComponent;
  let fixture: ComponentFixture<ProfileIdentityHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileIdentityHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileIdentityHeaderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
