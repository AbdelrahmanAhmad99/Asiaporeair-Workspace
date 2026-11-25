import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveClockZuluComponent } from './live-clock-zulu.component';

describe('LiveClockZuluComponent', () => {
  let component: LiveClockZuluComponent;
  let fixture: ComponentFixture<LiveClockZuluComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveClockZuluComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveClockZuluComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
