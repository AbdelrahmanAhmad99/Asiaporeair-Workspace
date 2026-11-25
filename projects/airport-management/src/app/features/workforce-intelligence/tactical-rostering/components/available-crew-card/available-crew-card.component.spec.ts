import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableCrewCardComponent } from './available-crew-card.component';

describe('AvailableCrewCardComponent', () => {
  let component: AvailableCrewCardComponent;
  let fixture: ComponentFixture<AvailableCrewCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailableCrewCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailableCrewCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
