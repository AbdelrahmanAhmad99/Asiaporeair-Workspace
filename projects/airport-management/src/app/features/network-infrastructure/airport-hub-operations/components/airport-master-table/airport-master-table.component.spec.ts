import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirportMasterTableComponent } from './airport-master-table.component';

describe('AirportMasterTableComponent', () => {
  let component: AirportMasterTableComponent;
  let fixture: ComponentFixture<AirportMasterTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirportMasterTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirportMasterTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
