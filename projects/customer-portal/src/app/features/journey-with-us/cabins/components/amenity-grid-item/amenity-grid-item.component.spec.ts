import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmenityGridItemComponent } from './amenity-grid-item.component';

describe('AmenityGridItemComponent', () => {
  let component: AmenityGridItemComponent;
  let fixture: ComponentFixture<AmenityGridItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmenityGridItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmenityGridItemComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
