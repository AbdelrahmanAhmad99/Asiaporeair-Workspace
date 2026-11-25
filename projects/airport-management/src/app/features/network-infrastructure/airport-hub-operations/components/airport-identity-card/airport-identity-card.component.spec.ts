import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirportIdentityCardComponent } from './airport-identity-card.component';

describe('AirportIdentityCardComponent', () => {
  let component: AirportIdentityCardComponent;
  let fixture: ComponentFixture<AirportIdentityCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirportIdentityCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirportIdentityCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
