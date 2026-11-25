import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryInventoryComponent } from './country-inventory.component';

describe('CountryInventoryComponent', () => {
  let component: CountryInventoryComponent;
  let fixture: ComponentFixture<CountryInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryInventoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountryInventoryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
