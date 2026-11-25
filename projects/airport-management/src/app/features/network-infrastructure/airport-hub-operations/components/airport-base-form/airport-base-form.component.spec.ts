import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirportBaseFormComponent } from './airport-base-form.component';

describe('AirportBaseFormComponent', () => {
  let component: AirportBaseFormComponent;
  let fixture: ComponentFixture<AirportBaseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirportBaseFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirportBaseFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
