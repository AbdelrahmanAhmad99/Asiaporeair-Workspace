import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightSearchEngineComponent } from './flight-search-engine.component';

describe('FlightSearchEngineComponent', () => {
  let component: FlightSearchEngineComponent;
  let fixture: ComponentFixture<FlightSearchEngineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightSearchEngineComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FlightSearchEngineComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
