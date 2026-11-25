import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecommissionModalComponent } from './decommission-modal.component';

describe('DecommissionModalComponent', () => {
  let component: DecommissionModalComponent;
  let fixture: ComponentFixture<DecommissionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecommissionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecommissionModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
