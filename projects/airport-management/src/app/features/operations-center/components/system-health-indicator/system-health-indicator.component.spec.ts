import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemHealthIndicatorComponent } from './system-health-indicator.component';

describe('SystemHealthIndicatorComponent', () => {
  let component: SystemHealthIndicatorComponent;
  let fixture: ComponentFixture<SystemHealthIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemHealthIndicatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemHealthIndicatorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
