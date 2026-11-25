import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingAttributeArchiveComponent } from './pricing-attribute-archive.component';

describe('PricingAttributeArchiveComponent', () => {
  let component: PricingAttributeArchiveComponent;
  let fixture: ComponentFixture<PricingAttributeArchiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingAttributeArchiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PricingAttributeArchiveComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
