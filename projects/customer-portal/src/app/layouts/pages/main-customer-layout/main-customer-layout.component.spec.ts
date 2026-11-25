import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainCustomerLayoutComponent } from './main-customer-layout.component';

describe('MainCustomerLayoutComponent', () => {
  let component: MainCustomerLayoutComponent;
  let fixture: ComponentFixture<MainCustomerLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainCustomerLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainCustomerLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
