import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdHocFlightFormComponent } from './ad-hoc-flight-form.component';

describe('AdHocFlightFormComponent', () => {
  let component: AdHocFlightFormComponent;
  let fixture: ComponentFixture<AdHocFlightFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdHocFlightFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdHocFlightFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
