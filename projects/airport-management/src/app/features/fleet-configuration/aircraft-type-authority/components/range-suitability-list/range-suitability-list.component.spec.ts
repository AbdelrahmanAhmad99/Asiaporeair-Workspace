import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RangeSuitabilityListComponent } from './range-suitability-list.component';

describe('RangeSuitabilityListComponent', () => {
  let component: RangeSuitabilityListComponent;
  let fixture: ComponentFixture<RangeSuitabilityListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RangeSuitabilityListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RangeSuitabilityListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
