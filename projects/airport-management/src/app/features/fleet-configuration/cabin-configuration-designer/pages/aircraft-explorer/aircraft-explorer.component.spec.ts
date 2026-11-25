import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AircraftExplorerComponent } from './aircraft-explorer.component';

describe('AircraftExplorerComponent', () => {
  let component: AircraftExplorerComponent;
  let fixture: ComponentFixture<AircraftExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AircraftExplorerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AircraftExplorerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
