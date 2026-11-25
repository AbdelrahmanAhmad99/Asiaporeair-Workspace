import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancellationReasonFormComponent } from './cancellation-reason-form.component';

describe('CancellationReasonFormComponent', () => {
  let component: CancellationReasonFormComponent;
  let fixture: ComponentFixture<CancellationReasonFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancellationReasonFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancellationReasonFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
