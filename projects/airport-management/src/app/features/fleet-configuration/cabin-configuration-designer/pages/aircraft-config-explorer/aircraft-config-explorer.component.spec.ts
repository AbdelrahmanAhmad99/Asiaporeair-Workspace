import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AircraftConfigExplorerComponent } from './aircraft-config-explorer.component';

describe('AircraftConfigExplorerComponent', () => {
  let component: AircraftConfigExplorerComponent;
  let fixture: ComponentFixture<AircraftConfigExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AircraftConfigExplorerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AircraftConfigExplorerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
