import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyBookingComponent } from './modify-booking.component';

describe('ModifyBookingComponent', () => {
  let component: ModifyBookingComponent;
  let fixture: ComponentFixture<ModifyBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifyBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifyBookingComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
