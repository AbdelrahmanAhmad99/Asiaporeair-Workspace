import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FidsDigitalBoardComponent } from './fids-digital-board.component';

describe('FidsDigitalBoardComponent', () => {
  let component: FidsDigitalBoardComponent;
  let fixture: ComponentFixture<FidsDigitalBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FidsDigitalBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FidsDigitalBoardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
