import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalDutyVisualizerComponent } from './personal-duty-visualizer.component';

describe('PersonalDutyVisualizerComponent', () => {
  let component: PersonalDutyVisualizerComponent;
  let fixture: ComponentFixture<PersonalDutyVisualizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalDutyVisualizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalDutyVisualizerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
