import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionSummaryStickyComponent } from './selection-summary-sticky.component';

describe('SelectionSummaryStickyComponent', () => {
  let component: SelectionSummaryStickyComponent;
  let fixture: ComponentFixture<SelectionSummaryStickyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionSummaryStickyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectionSummaryStickyComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
