import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TierStatusCardComponent } from './tier-status-card.component';

describe('TierStatusCardComponent', () => {
  let component: TierStatusCardComponent;
  let fixture: ComponentFixture<TierStatusCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TierStatusCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TierStatusCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
