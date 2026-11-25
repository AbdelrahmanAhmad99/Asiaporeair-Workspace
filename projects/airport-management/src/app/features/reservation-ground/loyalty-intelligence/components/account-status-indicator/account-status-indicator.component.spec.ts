import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountStatusIndicatorComponent } from './account-status-indicator.component';

describe('AccountStatusIndicatorComponent', () => {
  let component: AccountStatusIndicatorComponent;
  let fixture: ComponentFixture<AccountStatusIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountStatusIndicatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountStatusIndicatorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
