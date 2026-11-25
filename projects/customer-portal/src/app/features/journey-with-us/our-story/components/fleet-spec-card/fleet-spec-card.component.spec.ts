import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetSpecCardComponent } from './fleet-spec-card.component';

describe('FleetSpecCardComponent', () => {
  let component: FleetSpecCardComponent;
  let fixture: ComponentFixture<FleetSpecCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FleetSpecCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FleetSpecCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
