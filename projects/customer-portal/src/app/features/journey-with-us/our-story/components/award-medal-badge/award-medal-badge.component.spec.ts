import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwardMedalBadgeComponent } from './award-medal-badge.component';

describe('AwardMedalBadgeComponent', () => {
  let component: AwardMedalBadgeComponent;
  let fixture: ComponentFixture<AwardMedalBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AwardMedalBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AwardMedalBadgeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
