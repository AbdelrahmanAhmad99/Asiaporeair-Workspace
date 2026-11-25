import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkforceKpiBarComponent } from './workforce-kpi-bar.component';

describe('WorkforceKpiBarComponent', () => {
  let component: WorkforceKpiBarComponent;
  let fixture: ComponentFixture<WorkforceKpiBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkforceKpiBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkforceKpiBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
