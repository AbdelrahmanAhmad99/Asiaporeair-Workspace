import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AncillaryCategoryTabsComponent } from './ancillary-category-tabs.component';

describe('AncillaryCategoryTabsComponent', () => {
  let component: AncillaryCategoryTabsComponent;
  let fixture: ComponentFixture<AncillaryCategoryTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AncillaryCategoryTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AncillaryCategoryTabsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
