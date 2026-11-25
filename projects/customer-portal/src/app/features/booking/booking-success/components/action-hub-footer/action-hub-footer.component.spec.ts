import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionHubFooterComponent } from './action-hub-footer.component';

describe('ActionHubFooterComponent', () => {
  let component: ActionHubFooterComponent;
  let fixture: ComponentFixture<ActionHubFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionHubFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionHubFooterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
