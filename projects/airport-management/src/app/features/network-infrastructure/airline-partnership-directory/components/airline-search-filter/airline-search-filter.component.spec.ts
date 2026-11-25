import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineSearchFilterComponent } from './airline-search-filter.component';

describe('AirlineSearchFilterComponent', () => {
  let component: AirlineSearchFilterComponent;
  let fixture: ComponentFixture<AirlineSearchFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineSearchFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineSearchFilterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
