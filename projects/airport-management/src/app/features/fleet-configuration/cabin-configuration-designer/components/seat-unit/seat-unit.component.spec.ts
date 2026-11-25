import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatUnitComponent } from './seat-unit.component';

describe('SeatUnitComponent', () => {
  let component: SeatUnitComponent;
  let fixture: ComponentFixture<SeatUnitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatUnitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeatUnitComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
