import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCatalogCardComponent } from './product-catalog-card.component';

describe('ProductCatalogCardComponent', () => {
  let component: ProductCatalogCardComponent;
  let fixture: ComponentFixture<ProductCatalogCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCatalogCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductCatalogCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
