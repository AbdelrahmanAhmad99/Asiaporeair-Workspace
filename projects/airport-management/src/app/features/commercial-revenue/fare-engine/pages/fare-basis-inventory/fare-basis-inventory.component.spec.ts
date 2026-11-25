import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FareBasisInventoryComponent } from './fare-basis-inventory.component';

describe('FareBasisInventoryComponent', () => {
  let component: FareBasisInventoryComponent;
  let fixture: ComponentFixture<FareBasisInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FareBasisInventoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FareBasisInventoryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
