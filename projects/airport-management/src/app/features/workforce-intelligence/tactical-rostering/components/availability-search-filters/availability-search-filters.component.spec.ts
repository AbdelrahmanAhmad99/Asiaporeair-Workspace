import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabilitySearchFiltersComponent } from './availability-search-filters.component';

describe('AvailabilitySearchFiltersComponent', () => {
  let component: AvailabilitySearchFiltersComponent;
  let fixture: ComponentFixture<AvailabilitySearchFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailabilitySearchFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailabilitySearchFiltersComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
