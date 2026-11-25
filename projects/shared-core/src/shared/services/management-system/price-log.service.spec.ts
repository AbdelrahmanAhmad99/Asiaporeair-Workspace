import { TestBed } from '@angular/core/testing';

import { PriceLogService } from './price-log.service';

describe('PriceLogService', () => {
  let service: PriceLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PriceLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
