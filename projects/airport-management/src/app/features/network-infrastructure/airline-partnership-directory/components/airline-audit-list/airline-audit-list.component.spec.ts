import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineAuditListComponent } from './airline-audit-list.component';

describe('AirlineAuditListComponent', () => {
  let component: AirlineAuditListComponent;
  let fixture: ComponentFixture<AirlineAuditListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineAuditListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineAuditListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
