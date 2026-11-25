import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancellationModalComponent } from './cancellation-modal.component';

describe('CancellationModalComponent', () => {
  let component: CancellationModalComponent;
  let fixture: ComponentFixture<CancellationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancellationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancellationModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
