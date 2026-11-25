import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionFooterComponent } from './action-footer.component';

describe('ActionFooterComponent', () => {
  let component: ActionFooterComponent;
  let fixture: ComponentFixture<ActionFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionFooterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
