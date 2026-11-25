import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryHeroSectionComponent } from './country-hero-section.component';

describe('CountryHeroSectionComponent', () => {
  let component: CountryHeroSectionComponent;
  let fixture: ComponentFixture<CountryHeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryHeroSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountryHeroSectionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
