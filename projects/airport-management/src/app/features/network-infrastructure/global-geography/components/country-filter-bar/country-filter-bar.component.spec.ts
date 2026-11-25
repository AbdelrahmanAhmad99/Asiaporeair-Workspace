import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryFilterBarComponent } from './country-filter-bar.component';

describe('CountryFilterBarComponent', () => {
  let component: CountryFilterBarComponent;
  let fixture: ComponentFixture<CountryFilterBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryFilterBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountryFilterBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
