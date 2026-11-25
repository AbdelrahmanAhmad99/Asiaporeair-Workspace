import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineProfileHeaderComponent } from './airline-profile-header.component';

describe('AirlineProfileHeaderComponent', () => {
  let component: AirlineProfileHeaderComponent;
  let fixture: ComponentFixture<AirlineProfileHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineProfileHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineProfileHeaderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
