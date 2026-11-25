import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineManagementFormComponent } from './airline-management-form.component';

describe('AirlineManagementFormComponent', () => {
  let component: AirlineManagementFormComponent;
  let fixture: ComponentFixture<AirlineManagementFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineManagementFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineManagementFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
