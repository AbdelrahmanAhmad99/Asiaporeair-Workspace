import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AircraftPickerModalComponent } from './aircraft-picker-modal.component';

describe('AircraftPickerModalComponent', () => {
  let component: AircraftPickerModalComponent;
  let fixture: ComponentFixture<AircraftPickerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AircraftPickerModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AircraftPickerModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
