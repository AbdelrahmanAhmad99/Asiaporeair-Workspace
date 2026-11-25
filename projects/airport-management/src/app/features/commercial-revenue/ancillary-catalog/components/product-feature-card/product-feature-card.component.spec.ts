import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductFeatureCardComponent } from './product-feature-card.component';

describe('ProductFeatureCardComponent', () => {
  let component: ProductFeatureCardComponent;
  let fixture: ComponentFixture<ProductFeatureCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFeatureCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductFeatureCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
