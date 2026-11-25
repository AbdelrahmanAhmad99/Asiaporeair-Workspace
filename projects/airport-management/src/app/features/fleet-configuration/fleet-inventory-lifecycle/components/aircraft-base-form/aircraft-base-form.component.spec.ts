import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AircraftBaseFormComponent } from './aircraft-base-form.component';

describe('AircraftBaseFormComponent', () => {
  let component: AircraftBaseFormComponent;
  let fixture: ComponentFixture<AircraftBaseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AircraftBaseFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AircraftBaseFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
