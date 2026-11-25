import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengerDetailFormComponent } from './passenger-detail-form.component';

describe('PassengerDetailFormComponent', () => {
  let component: PassengerDetailFormComponent;
  let fixture: ComponentFixture<PassengerDetailFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassengerDetailFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PassengerDetailFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
