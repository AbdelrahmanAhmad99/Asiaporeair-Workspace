import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AncillaryCategoryFilterComponent } from './ancillary-category-filter.component';

describe('AncillaryCategoryFilterComponent', () => {
  let component: AncillaryCategoryFilterComponent;
  let fixture: ComponentFixture<AncillaryCategoryFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AncillaryCategoryFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AncillaryCategoryFilterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
