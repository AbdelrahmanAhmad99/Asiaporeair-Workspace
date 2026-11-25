import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionButtonsGroupComponent } from './action-buttons-group.component';

describe('ActionButtonsGroupComponent', () => {
  let component: ActionButtonsGroupComponent;
  let fixture: ComponentFixture<ActionButtonsGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionButtonsGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionButtonsGroupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
