import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineFleetTableComponent } from './airline-fleet-table.component';

describe('AirlineFleetTableComponent', () => {
  let component: AirlineFleetTableComponent;
  let fixture: ComponentFixture<AirlineFleetTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineFleetTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineFleetTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
