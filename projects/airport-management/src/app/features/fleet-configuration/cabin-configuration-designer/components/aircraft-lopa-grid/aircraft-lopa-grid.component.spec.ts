import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AircraftLopaGridComponent } from './aircraft-lopa-grid.component';

describe('AircraftLopaGridComponent', () => {
  let component: AircraftLopaGridComponent;
  let fixture: ComponentFixture<AircraftLopaGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AircraftLopaGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AircraftLopaGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
