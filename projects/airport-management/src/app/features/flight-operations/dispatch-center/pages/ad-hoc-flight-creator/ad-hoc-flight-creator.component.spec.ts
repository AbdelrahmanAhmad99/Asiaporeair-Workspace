import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdHocFlightCreatorComponent } from './ad-hoc-flight-creator.component';

describe('AdHocFlightCreatorComponent', () => {
  let component: AdHocFlightCreatorComponent;
  let fixture: ComponentFixture<AdHocFlightCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdHocFlightCreatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdHocFlightCreatorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
