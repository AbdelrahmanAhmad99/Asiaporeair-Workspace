import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchingResultPanelComponent } from './matching-result-panel.component';

describe('MatchingResultPanelComponent', () => {
  let component: MatchingResultPanelComponent;
  let fixture: ComponentFixture<MatchingResultPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchingResultPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchingResultPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
