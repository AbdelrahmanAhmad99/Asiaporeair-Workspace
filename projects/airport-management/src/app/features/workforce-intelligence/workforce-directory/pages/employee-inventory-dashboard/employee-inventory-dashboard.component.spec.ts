import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeInventoryDashboardComponent } from './employee-inventory-dashboard.component';

describe('EmployeeInventoryDashboardComponent', () => {
  let component: EmployeeInventoryDashboardComponent;
  let fixture: ComponentFixture<EmployeeInventoryDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeInventoryDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeInventoryDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
