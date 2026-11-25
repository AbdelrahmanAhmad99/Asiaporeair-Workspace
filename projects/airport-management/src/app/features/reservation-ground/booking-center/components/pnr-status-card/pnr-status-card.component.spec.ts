import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PnrStatusCardComponent } from './pnr-status-card.component';

describe('PnrStatusCardComponent', () => {
  let component: PnrStatusCardComponent;
  let fixture: ComponentFixture<PnrStatusCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PnrStatusCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PnrStatusCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
