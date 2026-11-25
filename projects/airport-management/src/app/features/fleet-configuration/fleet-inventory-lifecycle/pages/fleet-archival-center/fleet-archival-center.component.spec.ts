import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetArchivalCenterComponent } from './fleet-archival-center.component';

describe('FleetArchivalCenterComponent', () => {
  let component: FleetArchivalCenterComponent;
  let fixture: ComponentFixture<FleetArchivalCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FleetArchivalCenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FleetArchivalCenterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
