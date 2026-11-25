import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteStatsWidgetsComponent } from './route-stats-widgets.component';

describe('RouteStatsWidgetsComponent', () => {
  let component: RouteStatsWidgetsComponent;
  let fixture: ComponentFixture<RouteStatsWidgetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteStatsWidgetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteStatsWidgetsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
