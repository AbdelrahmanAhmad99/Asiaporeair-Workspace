import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardingPassDataGridComponent } from './boarding-pass-data-grid.component';

describe('BoardingPassDataGridComponent', () => {
  let component: BoardingPassDataGridComponent;
  let fixture: ComponentFixture<BoardingPassDataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardingPassDataGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardingPassDataGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
