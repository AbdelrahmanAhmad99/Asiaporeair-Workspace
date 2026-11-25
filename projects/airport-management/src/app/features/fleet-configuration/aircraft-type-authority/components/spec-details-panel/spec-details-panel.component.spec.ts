import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecDetailsPanelComponent } from './spec-details-panel.component';

describe('SpecDetailsPanelComponent', () => {
  let component: SpecDetailsPanelComponent;
  let fixture: ComponentFixture<SpecDetailsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecDetailsPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecDetailsPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
