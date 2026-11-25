import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GatewayCardComponent } from './gateway-card.component';

describe('GatewayCardComponent', () => {
  let component: GatewayCardComponent;
  let fixture: ComponentFixture<GatewayCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GatewayCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GatewayCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
