import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeEditorVisualizerComponent } from './attribute-editor-visualizer.component';

describe('AttributeEditorVisualizerComponent', () => {
  let component: AttributeEditorVisualizerComponent;
  let fixture: ComponentFixture<AttributeEditorVisualizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttributeEditorVisualizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttributeEditorVisualizerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
