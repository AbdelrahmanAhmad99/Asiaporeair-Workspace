import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterpriseWorkforceDashboardComponent } from './enterprise-workforce-dashboard.component';

describe('EnterpriseWorkforceDashboardComponent', () => {
  let component: EnterpriseWorkforceDashboardComponent;
  let fixture: ComponentFixture<EnterpriseWorkforceDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnterpriseWorkforceDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnterpriseWorkforceDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
