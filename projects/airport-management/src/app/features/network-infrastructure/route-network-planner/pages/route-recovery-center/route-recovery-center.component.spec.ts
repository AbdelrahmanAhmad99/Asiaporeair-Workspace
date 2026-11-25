import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteRecoveryCenterComponent } from './route-recovery-center.component';

describe('RouteRecoveryCenterComponent', () => {
  let component: RouteRecoveryCenterComponent;
  let fixture: ComponentFixture<RouteRecoveryCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteRecoveryCenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteRecoveryCenterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
