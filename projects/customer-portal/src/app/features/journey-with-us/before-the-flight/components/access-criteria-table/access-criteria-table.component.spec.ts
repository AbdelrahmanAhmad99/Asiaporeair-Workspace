import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessCriteriaTableComponent } from './access-criteria-table.component';

describe('AccessCriteriaTableComponent', () => {
  let component: AccessCriteriaTableComponent;
  let fixture: ComponentFixture<AccessCriteriaTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessCriteriaTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessCriteriaTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
