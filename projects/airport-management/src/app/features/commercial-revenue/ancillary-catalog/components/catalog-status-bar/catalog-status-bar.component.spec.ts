import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogStatusBarComponent } from './catalog-status-bar.component';

describe('CatalogStatusBarComponent', () => {
  let component: CatalogStatusBarComponent;
  let fixture: ComponentFixture<CatalogStatusBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogStatusBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogStatusBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
