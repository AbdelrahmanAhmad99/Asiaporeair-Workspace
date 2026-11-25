import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperienceFeatureBlockComponent } from './experience-feature-block.component';

describe('ExperienceFeatureBlockComponent', () => {
  let component: ExperienceFeatureBlockComponent;
  let fixture: ComponentFixture<ExperienceFeatureBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperienceFeatureBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperienceFeatureBlockComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
