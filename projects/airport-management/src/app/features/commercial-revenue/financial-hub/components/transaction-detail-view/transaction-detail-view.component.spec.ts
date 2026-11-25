import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionDetailViewComponent } from './transaction-detail-view.component';

describe('TransactionDetailViewComponent', () => {
  let component: TransactionDetailViewComponent;
  let fixture: ComponentFixture<TransactionDetailViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionDetailViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionDetailViewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
