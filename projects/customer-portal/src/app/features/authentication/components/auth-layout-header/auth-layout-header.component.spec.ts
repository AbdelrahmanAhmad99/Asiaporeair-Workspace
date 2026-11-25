import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthLayoutHeaderComponent } from './auth-layout-header.component';

describe('AuthLayoutHeaderComponent', () => {
  let component: AuthLayoutHeaderComponent;
  let fixture: ComponentFixture<AuthLayoutHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLayoutHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthLayoutHeaderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
