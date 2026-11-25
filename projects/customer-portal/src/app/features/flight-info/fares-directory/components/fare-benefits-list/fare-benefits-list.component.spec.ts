import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FareBenefitsListComponent } from './fare-benefits-list.component';

describe('FareBenefitsListComponent', () => {
  let component: FareBenefitsListComponent;
  let fixture: ComponentFixture<FareBenefitsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FareBenefitsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FareBenefitsListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
