import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MilesBalanceWidgetComponent } from './miles-balance-widget.component';

describe('MilesBalanceWidgetComponent', () => {
  let component: MilesBalanceWidgetComponent;
  let fixture: ComponentFixture<MilesBalanceWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MilesBalanceWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MilesBalanceWidgetComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
