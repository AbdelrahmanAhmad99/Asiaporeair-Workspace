import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightFinalManifestComponent } from './flight-final-manifest.component';

describe('FlightFinalManifestComponent', () => {
  let component: FlightFinalManifestComponent;
  let fixture: ComponentFixture<FlightFinalManifestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightFinalManifestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightFinalManifestComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
