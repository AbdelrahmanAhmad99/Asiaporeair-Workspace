import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardingPassSelectorGridComponent } from './boarding-pass-selector-grid.component';

describe('BoardingPassSelectorGridComponent', () => {
  let component: BoardingPassSelectorGridComponent;
  let fixture: ComponentFixture<BoardingPassSelectorGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardingPassSelectorGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardingPassSelectorGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
