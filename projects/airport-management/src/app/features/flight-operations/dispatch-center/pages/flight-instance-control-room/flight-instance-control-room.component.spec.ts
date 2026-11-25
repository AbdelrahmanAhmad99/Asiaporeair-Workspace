import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightInstanceControlRoomComponent } from './flight-instance-control-room.component';

describe('FlightInstanceControlRoomComponent', () => {
  let component: FlightInstanceControlRoomComponent;
  let fixture: ComponentFixture<FlightInstanceControlRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightInstanceControlRoomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightInstanceControlRoomComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
