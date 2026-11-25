import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDefinitionCenterComponent } from './product-definition-center.component';

describe('ProductDefinitionCenterComponent', () => {
  let component: ProductDefinitionCenterComponent;
  let fixture: ComponentFixture<ProductDefinitionCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDefinitionCenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDefinitionCenterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
