import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HiringVelocityGraphComponent } from './hiring-velocity-graph.component';

describe('HiringVelocityGraphComponent', () => {
  let component: HiringVelocityGraphComponent;
  let fixture: ComponentFixture<HiringVelocityGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HiringVelocityGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HiringVelocityGraphComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
