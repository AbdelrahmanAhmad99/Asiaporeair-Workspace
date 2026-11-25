import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveFlightGridComponent } from './live-flight-grid.component';

describe('LiveFlightGridComponent', () => {
  let component: LiveFlightGridComponent;
  let fixture: ComponentFixture<LiveFlightGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveFlightGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveFlightGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
