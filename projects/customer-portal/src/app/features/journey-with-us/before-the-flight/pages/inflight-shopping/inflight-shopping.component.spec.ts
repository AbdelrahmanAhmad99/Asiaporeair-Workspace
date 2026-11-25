import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InflightShoppingComponent } from './inflight-shopping.component';

describe('InflightShoppingComponent', () => {
  let component: InflightShoppingComponent;
  let fixture: ComponentFixture<InflightShoppingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InflightShoppingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InflightShoppingComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
