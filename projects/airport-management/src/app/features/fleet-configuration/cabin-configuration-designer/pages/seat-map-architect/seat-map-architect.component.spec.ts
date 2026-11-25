import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatMapArchitectComponent } from './seat-map-architect.component';

describe('SeatMapArchitectComponent', () => {
  let component: SeatMapArchitectComponent;
  let fixture: ComponentFixture<SeatMapArchitectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatMapArchitectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeatMapArchitectComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
