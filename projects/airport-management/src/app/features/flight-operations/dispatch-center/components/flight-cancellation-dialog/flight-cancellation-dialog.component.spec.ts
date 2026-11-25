import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightCancellationDialogComponent } from './flight-cancellation-dialog.component';

describe('FlightCancellationDialogComponent', () => {
  let component: FlightCancellationDialogComponent;
  let fixture: ComponentFixture<FlightCancellationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightCancellationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightCancellationDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
