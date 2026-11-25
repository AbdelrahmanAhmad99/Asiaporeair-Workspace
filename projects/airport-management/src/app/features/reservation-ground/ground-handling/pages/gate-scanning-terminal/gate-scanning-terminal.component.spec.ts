import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GateScanningTerminalComponent } from './gate-scanning-terminal.component';

describe('GateScanningTerminalComponent', () => {
  let component: GateScanningTerminalComponent;
  let fixture: ComponentFixture<GateScanningTerminalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GateScanningTerminalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GateScanningTerminalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
