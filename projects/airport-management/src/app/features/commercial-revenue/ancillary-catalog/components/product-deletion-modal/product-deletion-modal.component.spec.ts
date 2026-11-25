import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDeletionModalComponent } from './product-deletion-modal.component';

describe('ProductDeletionModalComponent', () => {
  let component: ProductDeletionModalComponent;
  let fixture: ComponentFixture<ProductDeletionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDeletionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDeletionModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
