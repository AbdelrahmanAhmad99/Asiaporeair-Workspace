import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleSimulationLabComponent } from './rule-simulation-lab.component';

describe('RuleSimulationLabComponent', () => {
  let component: RuleSimulationLabComponent;
  let fixture: ComponentFixture<RuleSimulationLabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleSimulationLabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RuleSimulationLabComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
