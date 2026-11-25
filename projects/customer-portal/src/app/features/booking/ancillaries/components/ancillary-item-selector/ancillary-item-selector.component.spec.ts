import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AncillaryItemSelectorComponent } from './ancillary-item-selector.component';

describe('AncillaryItemSelectorComponent', () => {
  let component: AncillaryItemSelectorComponent;
  let fixture: ComponentFixture<AncillaryItemSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AncillaryItemSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AncillaryItemSelectorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
