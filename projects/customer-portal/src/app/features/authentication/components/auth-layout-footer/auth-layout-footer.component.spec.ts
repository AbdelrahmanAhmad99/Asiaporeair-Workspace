import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthLayoutFooterComponent } from './auth-layout-footer.component';

describe('AuthLayoutFooterComponent', () => {
  let component: AuthLayoutFooterComponent;
  let fixture: ComponentFixture<AuthLayoutFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLayoutFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthLayoutFooterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
