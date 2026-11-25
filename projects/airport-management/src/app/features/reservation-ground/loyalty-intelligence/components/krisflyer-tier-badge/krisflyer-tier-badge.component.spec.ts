import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KrisflyerTierBadgeComponent } from './krisflyer-tier-badge.component';

describe('KrisflyerTierBadgeComponent', () => {
  let component: KrisflyerTierBadgeComponent;
  let fixture: ComponentFixture<KrisflyerTierBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KrisflyerTierBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KrisflyerTierBadgeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
