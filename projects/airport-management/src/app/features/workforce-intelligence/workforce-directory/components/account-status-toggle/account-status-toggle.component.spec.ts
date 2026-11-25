import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountStatusToggleComponent } from './account-status-toggle.component';

describe('AccountStatusToggleComponent', () => {
  let component: AccountStatusToggleComponent;
  let fixture: ComponentFixture<AccountStatusToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountStatusToggleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountStatusToggleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
