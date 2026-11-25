import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FareSearchFilterComponent } from './fare-search-filter.component';

describe('FareSearchFilterComponent', () => {
  let component: FareSearchFilterComponent;
  let fixture: ComponentFixture<FareSearchFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FareSearchFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FareSearchFilterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
