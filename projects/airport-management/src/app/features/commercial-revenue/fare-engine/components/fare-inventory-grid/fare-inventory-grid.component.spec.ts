import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FareInventoryGridComponent } from './fare-inventory-grid.component';

describe('FareInventoryGridComponent', () => {
  let component: FareInventoryGridComponent;
  let fixture: ComponentFixture<FareInventoryGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FareInventoryGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FareInventoryGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
