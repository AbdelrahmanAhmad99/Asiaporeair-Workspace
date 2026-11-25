import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeProfileHubComponent } from './employee-profile-hub.component';

describe('EmployeeProfileHubComponent', () => {
  let component: EmployeeProfileHubComponent;
  let fixture: ComponentFixture<EmployeeProfileHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeProfileHubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeProfileHubComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
