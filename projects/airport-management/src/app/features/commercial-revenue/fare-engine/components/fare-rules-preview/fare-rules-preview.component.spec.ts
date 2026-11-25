import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FareRulesPreviewComponent } from './fare-rules-preview.component';

describe('FareRulesPreviewComponent', () => {
  let component: FareRulesPreviewComponent;
  let fixture: ComponentFixture<FareRulesPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FareRulesPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FareRulesPreviewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
