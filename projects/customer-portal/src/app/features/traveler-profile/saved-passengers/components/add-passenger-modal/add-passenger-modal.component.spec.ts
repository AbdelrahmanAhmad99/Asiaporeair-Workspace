import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPassengerModalComponent } from './add-passenger-modal.component';

describe('AddPassengerModalComponent', () => {
  let component: AddPassengerModalComponent;
  let fixture: ComponentFixture<AddPassengerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPassengerModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPassengerModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
