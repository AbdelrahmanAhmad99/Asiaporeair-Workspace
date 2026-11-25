import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleBuilderFormComponent } from './rule-builder-form.component';

describe('RuleBuilderFormComponent', () => {
  let component: RuleBuilderFormComponent;
  let fixture: ComponentFixture<RuleBuilderFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleBuilderFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RuleBuilderFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
