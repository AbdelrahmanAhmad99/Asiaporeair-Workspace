import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegItemCardComponent } from './leg-item-card.component';

describe('LegItemCardComponent', () => {
  let component: LegItemCardComponent;
  let fixture: ComponentFixture<LegItemCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegItemCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegItemCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
