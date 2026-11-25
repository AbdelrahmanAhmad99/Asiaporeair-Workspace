import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketViewerComponent } from './ticket-viewer.component';

describe('TicketViewerComponent', () => {
  let component: TicketViewerComponent;
  let fixture: ComponentFixture<TicketViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketViewerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
