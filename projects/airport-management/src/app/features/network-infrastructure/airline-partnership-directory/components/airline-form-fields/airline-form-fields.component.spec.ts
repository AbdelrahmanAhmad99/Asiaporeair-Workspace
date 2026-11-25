import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineFormFieldsComponent } from './airline-form-fields.component';

describe('AirlineFormFieldsComponent', () => {
  let component: AirlineFormFieldsComponent;
  let fixture: ComponentFixture<AirlineFormFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineFormFieldsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineFormFieldsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
