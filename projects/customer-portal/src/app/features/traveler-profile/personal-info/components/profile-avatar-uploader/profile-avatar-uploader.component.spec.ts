import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileAvatarUploaderComponent } from './profile-avatar-uploader.component';

describe('ProfileAvatarUploaderComponent', () => {
  let component: ProfileAvatarUploaderComponent;
  let fixture: ComponentFixture<ProfileAvatarUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileAvatarUploaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileAvatarUploaderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
