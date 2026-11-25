import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoyaltyJoinBannerComponent } from './loyalty-join-banner.component';

describe('LoyaltyJoinBannerComponent', () => {
  let component: LoyaltyJoinBannerComponent;
  let fixture: ComponentFixture<LoyaltyJoinBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoyaltyJoinBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoyaltyJoinBannerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
