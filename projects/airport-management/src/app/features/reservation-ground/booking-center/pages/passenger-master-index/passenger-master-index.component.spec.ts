import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengerMasterIndexComponent } from './passenger-master-index.component';

describe('PassengerMasterIndexComponent', () => {
  let component: PassengerMasterIndexComponent;
  let fixture: ComponentFixture<PassengerMasterIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassengerMasterIndexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PassengerMasterIndexComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
