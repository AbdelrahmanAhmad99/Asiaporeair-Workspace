import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeEditorWizardComponent } from './type-editor-wizard.component';

describe('TypeEditorWizardComponent', () => {
  let component: TypeEditorWizardComponent;
  let fixture: ComponentFixture<TypeEditorWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeEditorWizardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeEditorWizardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
