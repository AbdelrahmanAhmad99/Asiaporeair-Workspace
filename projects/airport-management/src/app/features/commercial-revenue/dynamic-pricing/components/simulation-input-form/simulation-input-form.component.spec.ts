import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulationInputFormComponent } from './simulation-input-form.component';

describe('SimulationInputFormComponent', () => {
  let component: SimulationInputFormComponent;
  let fixture: ComponentFixture<SimulationInputFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimulationInputFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimulationInputFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
