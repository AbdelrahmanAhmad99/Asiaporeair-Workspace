import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeStatsCardsComponent } from './type-stats-cards.component';

describe('TypeStatsCardsComponent', () => {
  let component: TypeStatsCardsComponent;
  let fixture: ComponentFixture<TypeStatsCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeStatsCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeStatsCardsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
