import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AircraftDataDenseGridComponent } from './aircraft-data-dense-grid.component';

describe('AircraftDataDenseGridComponent', () => {
  let component: AircraftDataDenseGridComponent;
  let fixture: ComponentFixture<AircraftDataDenseGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AircraftDataDenseGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AircraftDataDenseGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
