import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteExplorerDashboardComponent } from './route-explorer-dashboard.component';

describe('RouteExplorerDashboardComponent', () => {
  let component: RouteExplorerDashboardComponent;
  let fixture: ComponentFixture<RouteExplorerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteExplorerDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteExplorerDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
