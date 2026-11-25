import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirportDetailsViewComponent } from './airport-details-view.component';

describe('AirportDetailsViewComponent', () => {
  let component: AirportDetailsViewComponent;
  let fixture: ComponentFixture<AirportDetailsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirportDetailsViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirportDetailsViewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
