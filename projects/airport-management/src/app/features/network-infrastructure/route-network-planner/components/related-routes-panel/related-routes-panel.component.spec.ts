import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedRoutesPanelComponent } from './related-routes-panel.component';

describe('RelatedRoutesPanelComponent', () => {
  let component: RelatedRoutesPanelComponent;
  let fixture: ComponentFixture<RelatedRoutesPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatedRoutesPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelatedRoutesPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
