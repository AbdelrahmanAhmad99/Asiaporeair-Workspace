import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteAuditTableComponent } from './route-audit-table.component';

describe('RouteAuditTableComponent', () => {
  let component: RouteAuditTableComponent;
  let fixture: ComponentFixture<RouteAuditTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteAuditTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteAuditTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
