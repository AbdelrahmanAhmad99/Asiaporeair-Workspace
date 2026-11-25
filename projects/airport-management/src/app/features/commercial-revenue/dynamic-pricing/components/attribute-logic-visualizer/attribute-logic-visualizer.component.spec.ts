import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeLogicVisualizerComponent } from './attribute-logic-visualizer.component';

describe('AttributeLogicVisualizerComponent', () => {
  let component: AttributeLogicVisualizerComponent;
  let fixture: ComponentFixture<AttributeLogicVisualizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttributeLogicVisualizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttributeLogicVisualizerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
