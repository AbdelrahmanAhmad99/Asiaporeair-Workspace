import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRegistrationDynamicComponent } from './user-registration-dynamic.component';

describe('UserRegistrationDynamicComponent', () => {
  let component: UserRegistrationDynamicComponent;
  let fixture: ComponentFixture<UserRegistrationDynamicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRegistrationDynamicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRegistrationDynamicComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
