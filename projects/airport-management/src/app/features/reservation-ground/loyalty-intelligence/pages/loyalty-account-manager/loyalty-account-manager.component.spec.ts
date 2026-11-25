import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoyaltyAccountManagerComponent } from './loyalty-account-manager.component';

describe('LoyaltyAccountManagerComponent', () => {
  let component: LoyaltyAccountManagerComponent;
  let fixture: ComponentFixture<LoyaltyAccountManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoyaltyAccountManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoyaltyAccountManagerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
