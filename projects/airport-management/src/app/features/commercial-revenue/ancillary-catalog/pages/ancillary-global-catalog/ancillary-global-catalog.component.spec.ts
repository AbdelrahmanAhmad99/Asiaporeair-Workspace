import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AncillaryGlobalCatalogComponent } from './ancillary-global-catalog.component';

describe('AncillaryGlobalCatalogComponent', () => {
  let component: AncillaryGlobalCatalogComponent;
  let fixture: ComponentFixture<AncillaryGlobalCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AncillaryGlobalCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AncillaryGlobalCatalogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
