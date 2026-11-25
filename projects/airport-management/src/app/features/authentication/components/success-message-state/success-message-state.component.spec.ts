import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessMessageStateComponent } from './success-message-state.component';

describe('SuccessMessageStateComponent', () => {
  let component: SuccessMessageStateComponent;
  let fixture: ComponentFixture<SuccessMessageStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessMessageStateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuccessMessageStateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
