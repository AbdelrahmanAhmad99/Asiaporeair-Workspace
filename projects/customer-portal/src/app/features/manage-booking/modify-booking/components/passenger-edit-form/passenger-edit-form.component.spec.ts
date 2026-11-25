import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengerEditFormComponent } from './passenger-edit-form.component';

describe('PassengerEditFormComponent', () => {
  let component: PassengerEditFormComponent;
  let fixture: ComponentFixture<PassengerEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassengerEditFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PassengerEditFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
