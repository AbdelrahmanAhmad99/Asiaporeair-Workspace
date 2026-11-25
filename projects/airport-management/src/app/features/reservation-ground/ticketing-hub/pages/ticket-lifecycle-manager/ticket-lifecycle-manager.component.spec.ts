import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketLifecycleManagerComponent } from './ticket-lifecycle-manager.component';

describe('TicketLifecycleManagerComponent', () => {
  let component: TicketLifecycleManagerComponent;
  let fixture: ComponentFixture<TicketLifecycleManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketLifecycleManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketLifecycleManagerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
