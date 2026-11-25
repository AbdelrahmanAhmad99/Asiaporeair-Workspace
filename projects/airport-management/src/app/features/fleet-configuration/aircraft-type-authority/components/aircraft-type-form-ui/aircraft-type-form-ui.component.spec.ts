import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AircraftTypeFormUiComponent } from './aircraft-type-form-ui.component';

describe('AircraftTypeFormUiComponent', () => {
  let component: AircraftTypeFormUiComponent;
  let fixture: ComponentFixture<AircraftTypeFormUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AircraftTypeFormUiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AircraftTypeFormUiComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
