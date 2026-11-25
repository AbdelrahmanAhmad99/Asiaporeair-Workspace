import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TierProgressBarComponent } from './tier-progress-bar.component';

describe('TierProgressBarComponent', () => {
  let component: TierProgressBarComponent;
  let fixture: ComponentFixture<TierProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TierProgressBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TierProgressBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
