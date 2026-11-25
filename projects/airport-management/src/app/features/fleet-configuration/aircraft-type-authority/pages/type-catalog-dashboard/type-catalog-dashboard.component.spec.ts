import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeCatalogDashboardComponent } from './type-catalog-dashboard.component';

describe('TypeCatalogDashboardComponent', () => {
  let component: TypeCatalogDashboardComponent;
  let fixture: ComponentFixture<TypeCatalogDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeCatalogDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeCatalogDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
