import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatAssignmentDisplayComponent } from './seat-assignment-display.component';

describe('SeatAssignmentDisplayComponent', () => {
  let component: SeatAssignmentDisplayComponent;
  let fixture: ComponentFixture<SeatAssignmentDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatAssignmentDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeatAssignmentDisplayComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
