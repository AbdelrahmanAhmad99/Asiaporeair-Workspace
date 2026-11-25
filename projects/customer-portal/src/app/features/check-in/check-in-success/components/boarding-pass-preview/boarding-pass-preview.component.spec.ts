import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardingPassPreviewComponent } from './boarding-pass-preview.component';

describe('BoardingPassPreviewComponent', () => {
  let component: BoardingPassPreviewComponent;
  let fixture: ComponentFixture<BoardingPassPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardingPassPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardingPassPreviewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
