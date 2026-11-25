import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryDataTableComponent } from './country-data-table.component';

describe('CountryDataTableComponent', () => {
  let component: CountryDataTableComponent;
  let fixture: ComponentFixture<CountryDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryDataTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountryDataTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
