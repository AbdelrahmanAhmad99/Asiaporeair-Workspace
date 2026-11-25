import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyStateErrorComponent } from './empty-state-error.component';

describe('EmptyStateErrorComponent', () => {
  let component: EmptyStateErrorComponent;
  let fixture: ComponentFixture<EmptyStateErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateErrorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmptyStateErrorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
