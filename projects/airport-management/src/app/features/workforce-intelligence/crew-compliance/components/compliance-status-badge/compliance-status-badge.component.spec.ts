import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceStatusBadgeComponent } from './compliance-status-badge.component';

describe('ComplianceStatusBadgeComponent', () => {
  let component: ComplianceStatusBadgeComponent;
  let fixture: ComponentFixture<ComplianceStatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplianceStatusBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplianceStatusBadgeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
