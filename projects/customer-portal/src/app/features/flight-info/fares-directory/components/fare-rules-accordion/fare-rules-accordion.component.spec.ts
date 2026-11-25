import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FareRulesAccordionComponent } from './fare-rules-accordion.component';

describe('FareRulesAccordionComponent', () => {
  let component: FareRulesAccordionComponent;
  let fixture: ComponentFixture<FareRulesAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FareRulesAccordionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FareRulesAccordionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
