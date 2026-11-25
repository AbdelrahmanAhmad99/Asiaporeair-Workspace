import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirportTaxFormComponent } from './airport-tax-form.component';

describe('AirportTaxFormComponent', () => {
  let component: AirportTaxFormComponent;
  let fixture: ComponentFixture<AirportTaxFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirportTaxFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirportTaxFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
