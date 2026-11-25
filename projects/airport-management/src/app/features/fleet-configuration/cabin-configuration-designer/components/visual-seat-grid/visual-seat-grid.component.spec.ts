import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualSeatGridComponent } from './visual-seat-grid.component';

describe('VisualSeatGridComponent', () => {
  let component: VisualSeatGridComponent;
  let fixture: ComponentFixture<VisualSeatGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualSeatGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualSeatGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
