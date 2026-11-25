import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePictureUploaderComponent } from './profile-picture-uploader.component';

describe('ProfilePictureUploaderComponent', () => {
  let component: ProfilePictureUploaderComponent;
  let fixture: ComponentFixture<ProfilePictureUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePictureUploaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilePictureUploaderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
