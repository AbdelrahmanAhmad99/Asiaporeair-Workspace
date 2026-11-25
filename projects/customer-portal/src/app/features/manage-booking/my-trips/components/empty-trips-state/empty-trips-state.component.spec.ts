import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyTripsStateComponent } from './empty-trips-state.component';

describe('EmptyTripsStateComponent', () => {
  let component: EmptyTripsStateComponent;
  let fixture: ComponentFixture<EmptyTripsStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyTripsStateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmptyTripsStateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
