import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketFilterPanelComponent } from './ticket-filter-panel.component';

describe('TicketFilterPanelComponent', () => {
  let component: TicketFilterPanelComponent;
  let fixture: ComponentFixture<TicketFilterPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketFilterPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketFilterPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
