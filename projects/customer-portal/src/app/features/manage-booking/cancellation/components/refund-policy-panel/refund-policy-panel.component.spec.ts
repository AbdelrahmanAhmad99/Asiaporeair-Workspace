import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundPolicyPanelComponent } from './refund-policy-panel.component';

describe('RefundPolicyPanelComponent', () => {
  let component: RefundPolicyPanelComponent;
  let fixture: ComponentFixture<RefundPolicyPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefundPolicyPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RefundPolicyPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
