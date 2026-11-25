import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryStatsCardsComponent } from './country-stats-cards.component';

describe('CountryStatsCardsComponent', () => {
  let component: CountryStatsCardsComponent;
  let fixture: ComponentFixture<CountryStatsCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryStatsCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountryStatsCardsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
