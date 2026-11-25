import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChefQuoteCardComponent } from './chef-quote-card.component';

describe('ChefQuoteCardComponent', () => {
  let component: ChefQuoteCardComponent;
  let fixture: ComponentFixture<ChefQuoteCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChefQuoteCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChefQuoteCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
