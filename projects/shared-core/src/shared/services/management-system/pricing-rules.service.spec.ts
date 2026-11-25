import { TestBed } from '@angular/core/testing';

import { PricingRulesService } from './pricing-rules.service';

describe('PricingRulesService', () => {
  let service: PricingRulesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PricingRulesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
