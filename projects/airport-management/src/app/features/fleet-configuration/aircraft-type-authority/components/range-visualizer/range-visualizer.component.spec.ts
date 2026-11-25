import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RangeVisualizerComponent } from './range-visualizer.component';

describe('RangeVisualizerComponent', () => {
  let component: RangeVisualizerComponent;
  let fixture: ComponentFixture<RangeVisualizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RangeVisualizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RangeVisualizerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
