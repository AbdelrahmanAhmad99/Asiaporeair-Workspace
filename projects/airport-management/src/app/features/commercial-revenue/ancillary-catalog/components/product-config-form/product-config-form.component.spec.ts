import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductConfigFormComponent } from './product-config-form.component';

describe('ProductConfigFormComponent', () => {
  let component: ProductConfigFormComponent;
  let fixture: ComponentFixture<ProductConfigFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductConfigFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductConfigFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
