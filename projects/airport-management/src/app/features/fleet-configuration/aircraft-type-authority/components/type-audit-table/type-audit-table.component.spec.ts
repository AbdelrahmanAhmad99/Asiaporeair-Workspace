import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeAuditTableComponent } from './type-audit-table.component';

describe('TypeAuditTableComponent', () => {
  let component: TypeAuditTableComponent;
  let fixture: ComponentFixture<TypeAuditTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeAuditTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeAuditTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
