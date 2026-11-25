import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirportStatusToggleComponent } from './airport-status-toggle.component';

describe('AirportStatusToggleComponent', () => {
  let component: AirportStatusToggleComponent;
  let fixture: ComponentFixture<AirportStatusToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirportStatusToggleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirportStatusToggleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
