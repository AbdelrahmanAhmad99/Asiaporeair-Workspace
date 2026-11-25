import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetInventoryDashboardComponent } from './fleet-inventory-dashboard.component';

describe('FleetInventoryDashboardComponent', () => {
  let component: FleetInventoryDashboardComponent;
  let fixture: ComponentFixture<FleetInventoryDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FleetInventoryDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FleetInventoryDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
