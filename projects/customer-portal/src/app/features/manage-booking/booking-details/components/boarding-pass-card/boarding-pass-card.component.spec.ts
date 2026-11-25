import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardingPassCardComponent } from './boarding-pass-card.component';

describe('BoardingPassCardComponent', () => {
  let component: BoardingPassCardComponent;
  let fixture: ComponentFixture<BoardingPassCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardingPassCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardingPassCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
