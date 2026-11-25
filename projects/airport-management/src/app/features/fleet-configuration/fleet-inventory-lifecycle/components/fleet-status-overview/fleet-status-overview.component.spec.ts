import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetStatusOverviewComponent } from './fleet-status-overview.component';

describe('FleetStatusOverviewComponent', () => {
  let component: FleetStatusOverviewComponent;
  let fixture: ComponentFixture<FleetStatusOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FleetStatusOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FleetStatusOverviewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
