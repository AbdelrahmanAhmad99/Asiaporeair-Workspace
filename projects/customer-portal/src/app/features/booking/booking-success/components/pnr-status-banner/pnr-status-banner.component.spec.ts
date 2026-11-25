import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PnrStatusBannerComponent } from './pnr-status-banner.component';

describe('PnrStatusBannerComponent', () => {
  let component: PnrStatusBannerComponent;
  let fixture: ComponentFixture<PnrStatusBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PnrStatusBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PnrStatusBannerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
