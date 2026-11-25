import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicRuleEditorComponent } from './dynamic-rule-editor.component';

describe('DynamicRuleEditorComponent', () => {
  let component: DynamicRuleEditorComponent;
  let fixture: ComponentFixture<DynamicRuleEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicRuleEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicRuleEditorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
