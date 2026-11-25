import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CabinFeatureCardComponent } from './cabin-feature-card.component';

describe('CabinFeatureCardComponent', () => {
  let component: CabinFeatureCardComponent;
  let fixture: ComponentFixture<CabinFeatureCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CabinFeatureCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CabinFeatureCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
