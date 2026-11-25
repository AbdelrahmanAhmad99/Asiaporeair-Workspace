import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginHistoryListComponent } from './login-history-list.component';

describe('LoginHistoryListComponent', () => {
  let component: LoginHistoryListComponent;
  let fixture: ComponentFixture<LoginHistoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginHistoryListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginHistoryListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
