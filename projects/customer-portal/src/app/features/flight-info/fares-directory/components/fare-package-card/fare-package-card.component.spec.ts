import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarePackageCardComponent } from './fare-package-card.component';

describe('FarePackageCardComponent', () => {
  let component: FarePackageCardComponent;
  let fixture: ComponentFixture<FarePackageCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarePackageCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FarePackageCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
