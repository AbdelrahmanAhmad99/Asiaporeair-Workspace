import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardingStatusMonitorComponent } from './boarding-status-monitor.component';

describe('BoardingStatusMonitorComponent', () => {
  let component: BoardingStatusMonitorComponent;
  let fixture: ComponentFixture<BoardingStatusMonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardingStatusMonitorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardingStatusMonitorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
