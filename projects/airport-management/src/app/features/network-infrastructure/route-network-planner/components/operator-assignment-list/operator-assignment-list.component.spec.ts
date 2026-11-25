import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorAssignmentListComponent } from './operator-assignment-list.component';

describe('OperatorAssignmentListComponent', () => {
  let component: OperatorAssignmentListComponent;
  let fixture: ComponentFixture<OperatorAssignmentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperatorAssignmentListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperatorAssignmentListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
