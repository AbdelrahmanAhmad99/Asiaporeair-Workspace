import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusManagementFormComponent } from './status-management-form.component';

describe('StatusManagementFormComponent', () => {
  let component: StatusManagementFormComponent;
  let fixture: ComponentFixture<StatusManagementFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusManagementFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusManagementFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
