import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectivitySpeedBadgeComponent } from './connectivity-speed-badge.component';

describe('ConnectivitySpeedBadgeComponent', () => {
  let component: ConnectivitySpeedBadgeComponent;
  let fixture: ComponentFixture<ConnectivitySpeedBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectivitySpeedBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectivitySpeedBadgeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
