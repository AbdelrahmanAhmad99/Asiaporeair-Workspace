import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WifiConnectivityComponent } from './wifi-connectivity.component';

describe('WifiConnectivityComponent', () => {
  let component: WifiConnectivityComponent;
  let fixture: ComponentFixture<WifiConnectivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WifiConnectivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WifiConnectivityComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
