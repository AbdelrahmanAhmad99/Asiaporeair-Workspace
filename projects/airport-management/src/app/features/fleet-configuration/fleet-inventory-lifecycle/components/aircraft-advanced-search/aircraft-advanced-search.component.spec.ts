import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AircraftAdvancedSearchComponent } from './aircraft-advanced-search.component';

describe('AircraftAdvancedSearchComponent', () => {
  let component: AircraftAdvancedSearchComponent;
  let fixture: ComponentFixture<AircraftAdvancedSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AircraftAdvancedSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AircraftAdvancedSearchComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
