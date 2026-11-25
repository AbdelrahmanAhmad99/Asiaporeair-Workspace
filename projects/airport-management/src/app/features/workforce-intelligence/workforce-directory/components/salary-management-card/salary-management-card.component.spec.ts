import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryManagementCardComponent } from './salary-management-card.component';

describe('SalaryManagementCardComponent', () => {
  let component: SalaryManagementCardComponent;
  let fixture: ComponentFixture<SalaryManagementCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryManagementCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryManagementCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
