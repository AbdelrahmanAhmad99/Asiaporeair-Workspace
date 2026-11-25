import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactivateActionButtonComponent } from './reactivate-action-button.component';

describe('ReactivateActionButtonComponent', () => {
  let component: ReactivateActionButtonComponent;
  let fixture: ComponentFixture<ReactivateActionButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactivateActionButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReactivateActionButtonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
