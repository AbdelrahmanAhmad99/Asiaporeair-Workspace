import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GateFeedbackPanelComponent } from './gate-feedback-panel.component';

describe('GateFeedbackPanelComponent', () => {
  let component: GateFeedbackPanelComponent;
  let fixture: ComponentFixture<GateFeedbackPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GateFeedbackPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GateFeedbackPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
