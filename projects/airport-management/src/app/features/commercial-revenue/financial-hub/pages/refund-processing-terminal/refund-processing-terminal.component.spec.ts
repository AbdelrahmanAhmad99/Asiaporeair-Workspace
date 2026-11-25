import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundProcessingTerminalComponent } from './refund-processing-terminal.component';

describe('RefundProcessingTerminalComponent', () => {
  let component: RefundProcessingTerminalComponent;
  let fixture: ComponentFixture<RefundProcessingTerminalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefundProcessingTerminalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RefundProcessingTerminalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
