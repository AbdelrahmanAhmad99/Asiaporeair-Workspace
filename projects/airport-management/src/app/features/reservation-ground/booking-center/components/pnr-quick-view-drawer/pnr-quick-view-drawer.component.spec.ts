import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PnrQuickViewDrawerComponent } from './pnr-quick-view-drawer.component';

describe('PnrQuickViewDrawerComponent', () => {
  let component: PnrQuickViewDrawerComponent;
  let fixture: ComponentFixture<PnrQuickViewDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PnrQuickViewDrawerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PnrQuickViewDrawerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
