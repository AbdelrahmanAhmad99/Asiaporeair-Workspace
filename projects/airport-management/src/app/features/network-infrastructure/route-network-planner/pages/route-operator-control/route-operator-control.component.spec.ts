import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteOperatorControlComponent } from './route-operator-control.component';

describe('RouteOperatorControlComponent', () => {
  let component: RouteOperatorControlComponent;
  let fixture: ComponentFixture<RouteOperatorControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteOperatorControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteOperatorControlComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
