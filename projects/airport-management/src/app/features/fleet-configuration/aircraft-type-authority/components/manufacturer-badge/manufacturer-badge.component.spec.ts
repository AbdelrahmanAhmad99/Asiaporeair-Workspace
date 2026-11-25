import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufacturerBadgeComponent } from './manufacturer-badge.component';

describe('ManufacturerBadgeComponent', () => {
  let component: ManufacturerBadgeComponent;
  let fixture: ComponentFixture<ManufacturerBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManufacturerBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManufacturerBadgeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
