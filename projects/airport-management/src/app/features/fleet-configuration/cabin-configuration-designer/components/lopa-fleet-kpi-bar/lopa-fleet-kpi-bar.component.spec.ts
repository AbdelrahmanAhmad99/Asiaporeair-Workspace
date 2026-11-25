import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LopaFleetKpiBarComponent } from './lopa-fleet-kpi-bar.component';

describe('LopaFleetKpiBarComponent', () => {
  let component: LopaFleetKpiBarComponent;
  let fixture: ComponentFixture<LopaFleetKpiBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LopaFleetKpiBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LopaFleetKpiBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
