import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FareReactivationModalComponent } from './fare-reactivation-modal.component';

describe('FareReactivationModalComponent', () => {
  let component: FareReactivationModalComponent;
  let fixture: ComponentFixture<FareReactivationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FareReactivationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FareReactivationModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
