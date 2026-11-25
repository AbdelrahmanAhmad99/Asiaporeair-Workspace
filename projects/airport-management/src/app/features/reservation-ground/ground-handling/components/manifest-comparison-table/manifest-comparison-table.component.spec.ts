import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManifestComparisonTableComponent } from './manifest-comparison-table.component';

describe('ManifestComparisonTableComponent', () => {
  let component: ManifestComparisonTableComponent;
  let fixture: ComponentFixture<ManifestComparisonTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManifestComparisonTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManifestComparisonTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
